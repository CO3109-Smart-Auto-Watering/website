import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { getHistoricalData } from '../../services/sensorService';
import { useTheme } from '@mui/material/styles';

const ChartContainer = styled.div`
  padding: 20px;
  height: 400px;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
`;

const Controls = styled.div`
  display: flex;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
`;

// Custom tooltip to display both date and time
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '10px', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date(label).toLocaleString()}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '5px 0', color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === 'Độ ẩm không khí' || entry.name === 'Độ ẩm đất' ? '%' : '°C'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SensorChart = ({ selectedDevice }) => {
  const theme = useTheme();
  const [period, setPeriod] = useState('6h');
  const [sensorType, setSensorType] = useState('all');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDevice) {
        console.log('No selected device provided');
        setData([]);
        setError('Vui lòng chọn một thiết bị để hiển thị dữ liệu.');
        setLoading(false);
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        let limit;
        switch (period) {
          case '6h':
            limit = 24;
            break;
          case '24h':
            limit = 48;
            break;
          case '7d':
            limit = 84;
            break;
          case '30d':
            limit = 120;
            break;
          default:
            limit = 24;
        }
  
        console.log('Fetching data for:', { feedNames: ['sensor-temp', 'sensor-humidity', 'sensor-soil'], limit, deviceId: selectedDevice });
  
        const [tempData, humidityData, soilData] = await Promise.all([
          getHistoricalData('sensor-temp', limit, selectedDevice).catch(err => {
            console.error('Error fetching sensor-temp:', err.response?.data || err.message);
            return { success: false, data: [] };
          }),
          getHistoricalData('sensor-humidity', limit, selectedDevice).catch(err => {
            console.error('Error fetching sensor-humidity:', err.response?.data || err.message);
            return { success: false, data: [] };
          }),
          getHistoricalData('sensor-soil', limit, selectedDevice).catch(err => {
            console.error('Error fetching sensor-soil:', err.response?.data || err.message);
            return { success: false, data: [] };
          })
        ]);
  
        console.log('Fetched data:', { tempData, humidityData, soilData });
  
        if (!tempData.success && !humidityData.success && !soilData.success) {
          setError(tempData.data?.message || 'Thiết bị không tồn tại hoặc bạn không có quyền truy cập.');
          setData([]);
          setLoading(false);
          return;
        }
  
        const combinedData = processData(tempData, humidityData, soilData);
        console.log('Processed data:', combinedData);
  
        setData(combinedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      } catch (err) {
        console.error('Unexpected error fetching sensor data:', err);
        setError(err.response?.status === 403 
          ? 'Thiết bị không hợp lệ hoặc bạn không có quyền truy cập.' 
          : 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  
    // Polling: Gọi lại fetchData mỗi 10 giây
    const intervalId = setInterval(fetchData, 10000);
  
    // Cleanup interval khi component unmount hoặc dependencies thay đổi
    return () => clearInterval(intervalId);
  }, [period, selectedDevice]);
  
  // Hàm xử lý và kết hợp dữ liệu từ các cảm biến
  const processData = (tempData, humidityData, soilData) => {
    // Tạo map với key là timestamp để gộp dữ liệu cùng thời điểm
    const dataMap = new Map();
    
    // Xử lý dữ liệu nhiệt độ
    if (tempData && tempData.data) {
      tempData.data.forEach(item => {
        const timestamp = new Date(item.createdAt).getTime();
        if (!dataMap.has(timestamp)) {
          dataMap.set(timestamp, { 
            timestamp: timestamp,
            temperature: parseFloat(item.value)
          });
        } else {
          dataMap.get(timestamp).temperature = parseFloat(item.value);
        }
      });
    }
    
    // Xử lý dữ liệu độ ẩm không khí
    if (humidityData && humidityData.data) {
      humidityData.data.forEach(item => {
        const timestamp = new Date(item.createdAt).getTime();
        if (!dataMap.has(timestamp)) {
          dataMap.set(timestamp, { 
            timestamp: timestamp,
            humidity: parseFloat(item.value)
          });
        } else {
          dataMap.get(timestamp).humidity = parseFloat(item.value);
        }
      });
    }
    
    // Xử lý dữ liệu độ ẩm đất
    if (soilData && soilData.data) {
      soilData.data.forEach(item => {
        const timestamp = new Date(item.createdAt).getTime();
        if (!dataMap.has(timestamp)) {
          dataMap.set(timestamp, { 
            timestamp: timestamp,
            soil: parseFloat(item.value)
          });
        } else {
          dataMap.get(timestamp).soil = parseFloat(item.value);
        }
      });
    }
    
    // Chuyển Map thành Array để sử dụng với Recharts
    return Array.from(dataMap.values());
  };
  
  // Hiển thị màn hình loading
  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }
  
  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  // Hiển thị thông báo nếu không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">Không có dữ liệu cảm biến cho khoảng thời gian đã chọn.</Alert>
      </Box>
    );
  }

  return (
    <ChartContainer>
      <Controls>
        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <InputLabel>Khoảng thời gian</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Khoảng thời gian"
          >
            <MenuItem value="6h">6 giờ qua</MenuItem>
            <MenuItem value="24h">24 giờ qua</MenuItem>
            <MenuItem value="7d">7 ngày qua</MenuItem>
            <MenuItem value="30d">30 ngày qua</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <InputLabel>Loại cảm biến</InputLabel>
          <Select
            value={sensorType}
            onChange={(e) => setSensorType(e.target.value)}
            label="Loại cảm biến"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="temperature">Nhiệt độ</MenuItem>
            <MenuItem value="humidity">Độ ẩm không khí</MenuItem>
            <MenuItem value="soil">Độ ẩm đất</MenuItem>
          </Select>
        </FormControl>
      </Controls>

      <ResponsiveContainer width="100%" height="85%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 35 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp);
            return period === '30d' || period === '7d' 
              ? date.toLocaleDateString() 
              : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          }}
          label={{ 
            value: 'Thời gian', 
            position: 'insideBottomRight', 
            offset: -10,
            style: { textAnchor: 'end' }
          }}
          height={60}
          angle={-30}
          textAnchor="end"
        />
        
        {/* Chỉ giữ lại một trục Y duy nhất */}
        <YAxis 
          label={{ 
            value: 'Giá trị', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
          domain={[0, 'dataMax + 10']}
        />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {(sensorType === 'all' || sensorType === 'temperature') && (
          <Line
            type="monotone"
            dataKey="temperature"
            name="Nhiệt độ"
            stroke={theme.palette.error.main}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
        )}
        
        {(sensorType === 'all' || sensorType === 'humidity') && (
          <Line
            type="monotone"
            dataKey="humidity"
            name="Độ ẩm không khí"
            stroke={theme.palette.info.main}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
        )}
        
        {(sensorType === 'all' || sensorType === 'soil') && (
          <Line
            type="monotone"
            dataKey="soil"
            name="Độ ẩm đất"
            stroke={theme.palette.success.main}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SensorChart;