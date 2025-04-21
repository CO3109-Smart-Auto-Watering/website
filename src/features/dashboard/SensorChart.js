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

        const [tempData, humidityData, soilData] = await Promise.all([
          getHistoricalData('sensor-temp', limit, selectedDevice).catch(err => ({
            success: false,
            data: [],
          })),
          getHistoricalData('sensor-humidity', limit, selectedDevice).catch(err => ({
            success: false,
            data: [],
          })),
          getHistoricalData('sensor-soil', limit, selectedDevice).catch(err => ({
            success: false,
            data: [],
          })),
        ]);

        if (!tempData.success && !humidityData.success && !soilData.success) {
          setError('Thiết bị không tồn tại hoặc bạn không có quyền truy cập.');
          setData([]);
          setLoading(false);
          return;
        }

        const combinedData = processData(tempData, humidityData, soilData);
        setData(combinedData.sort((a, b) => a.timestamp - b.timestamp));
      } catch (err) {
        setError(
          err.response?.status === 403
            ? 'Thiết bị không hợp lệ hoặc bạn không có quyền truy cập.'
            : 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [period, selectedDevice]);

  // Hàm xử lý và kết hợp dữ liệu từ các cảm biến
  const processData = (tempData, humidityData, soilData) => {
    const dataMap = new Map();
    const timestamps = new Set();

    // Thu thập tất cả các timestamp từ các cảm biến
    const addTimestamps = (sensorData) => {
      if (sensorData && sensorData.data) {
        sensorData.data.forEach(item => {
          const timestamp = new Date(item.createdAt).getTime();
          timestamps.add(timestamp);
        });
      }
    };

    addTimestamps(tempData);
    addTimestamps(humidityData);
    addTimestamps(soilData);

    // Tạo dữ liệu cho mỗi timestamp
    timestamps.forEach(timestamp => {
      dataMap.set(timestamp, { timestamp });
    });

    // Xử lý dữ liệu nhiệt độ
    if (tempData && tempData.data) {
      tempData.data.forEach(item => {
        const timestamp = new Date(item.createdAt).getTime();
        dataMap.get(timestamp).temperature = parseFloat(item.value);
      });
    }

    // Xử lý dữ liệu độ ẩm không khí
    if (humidityData && humidityData.data) {
      humidityData.data.forEach(item => {
        const timestamp = new Date(item.createdAt).getTime();
        dataMap.get(timestamp).humidity = parseFloat(item.value);
      });
    }

    // Xử lý dữ liệu độ ẩm đất
    if (soilData && soilData.data) {
      soilData.data.forEach(item => {
        const timestamp = new Date(item.createdAt).getTime();
        dataMap.get(timestamp).soil = parseFloat(item.value);
      });
    }

    return Array.from(dataMap.values());
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
                : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }}
            label={{
              value: 'Thời gian',
              position: 'insideBottomRight',
              offset: -10,
              style: { textAnchor: 'end' },
            }}
            height={60}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            label={{
              value: 'Giá trị',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
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
              connectNulls={true}
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
              connectNulls={true}
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
              connectNulls={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default SensorChart;