import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaThermometerHalf, FaTint, FaSeedling, FaPrint, FaRegCalendarAlt, 
  FaPowerOff, FaMap, FaSlidersH, FaCloudSun, FaMapMarkedAlt, FaLeaf, 
  FaChartLine, FaWater, FaTools, FaCog, FaRobot } from 'react-icons/fa';
import { Box, useTheme, TextField, Slider, FormControl, InputLabel, MenuItem, Select, Typography, Button } from '@mui/material';


import AdafruitData from './AdafruitData';
import SensorChart from './SensorChart';
import PumpControl from './PumpControl';
import WeatherForecast from './WeatherForecast';
import { getUserDevices, getDeviceAreaMapping } from '../../services/deviceService';
import { getAreas } from '../../services/areaService';
import { sendCommand, getLatestSensorData, getAdafruitFeedData } from '../../services/sensorService';


// Thêm các styled components này sau phần import và trước khai báo component Dashboard

// Styled components
const Header = styled.div`
  margin-bottom: 24px;
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  color: ${props => props.theme.palette.text.primary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: ${props => props.theme.palette.background.paper};
  border-radius: 12px;
  box-shadow: ${props => props.theme.palette.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  overflow: hidden;
`;

const LargeCard = styled(Card)`
  grid-column: 1 / -1;
`;

const CardHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: ${props => props.theme.palette.primary.main};
  }
`;

const CardValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  padding: 24px;
  color: ${props => props.theme.palette.primary.main};
`;

// Thêm styled components mới
const DeviceSelector = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: ${props => props.theme.palette.background.paper};
  border-radius: 12px;
  box-shadow: ${props => props.theme.palette.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  color: ${props => props.theme.palette.text.primary};
  
  svg {
    margin-right: 8px;
    color: ${props => props.theme.palette.primary.main};
  }
`;

const DeviceInfo = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${props => props.theme.palette.mode === 'dark' 
    ? props.theme.palette.background.default 
    : '#f5f5f5'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.palette.divider};
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: ${props => props.theme.palette.primary.main};
  }
`;

const LabelText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.palette.text.secondary};
  margin-right: 8px;
  min-width: 120px;
`;

const ValueText = styled.span`
  font-size: 14px;
  color: ${props => props.theme.palette.text.primary};
  font-weight: 500;
`;


const Dashboard = () => {
  const muiTheme = useTheme();
  const [pumpMode, setPumpMode] = useState('auto'); 
  const [isPumpActive, setIsPumpActive] = useState(false);
  
  // State cho các tính năng mới
  const [selectedZone, setSelectedZone] = useState(1);
  const [thresholds, setThresholds] = useState({
    soilMoisture: 55,
    wateringDuration: 15
  });
  const [selectedArea, setSelectedArea] = useState(null);
  const [irrigationMode, setIrrigationMode] = useState('balanced');
  const [maintenanceNeeded, setMaintenanceNeeded] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  // State mới cho chức năng chọn thiết bị và thiết lập ngưỡng độ ẩm
  const [devices, setDevices] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [deviceAreaMap, setDeviceAreaMap] = useState({});
  const [moistureThreshold, setMoistureThreshold] = useState(60);
  const [moistureMaxThreshold, setMoistureMaxThreshold] = useState(80);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [currentSoilMoisture, setCurrentSoilMoisture] = useState(0);
  const [isThresholdActive, setIsThresholdActive] = useState(false);

  const [sensorValues, setSensorValues] = useState({
    temp: '--',
    humidity: '--',
    soil: '--'
  });
  
  useEffect(() => {
    const updateSensorValues = async () => {
      try {
        const [temp, humidity, soil] = await Promise.all([
          getAdafruitFeedData('sensor-temp'),
          getAdafruitFeedData('sensor-humidity'),
          getAdafruitFeedData('sensor-soil')
        ]);
        
        setSensorValues({
          temp: temp !== null ? temp : '--',
          humidity: humidity !== null ? humidity : '--',
          soil: soil !== null ? soil : '--'
        });
      } catch (error) {
        console.error('Error fetching sensor values:', error);
      }
    };
    
    updateSensorValues();
    const intervalId = setInterval(updateSensorValues, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Load devices, areas, and device-area mappings
  useEffect(() => {
    const fetchDevicesAndAreas = async () => {
      try {
        // Fetch devices
        const devicesResponse = await getUserDevices();
        if (devicesResponse.success) {
          setDevices(devicesResponse.devices);
          // Tự động chọn thiết bị đầu tiên nếu có
          if (devicesResponse.devices.length > 0) {
            setSelectedDevice(devicesResponse.devices[0].deviceId);
          }
        }
        
        // Fetch areas
        const areasResponse = await getAreas();
        if (areasResponse.success) {
          setAreas(areasResponse.areas);
        }
        
        // Fetch device-area mappings
        const mappingsResponse = await getDeviceAreaMapping();
        if (mappingsResponse.success) {
          // Tạo map từ deviceId -> { areaId, plantIndex }
          const mapping = {};
          mappingsResponse.mappings.forEach(item => {
            mapping[item.deviceId] = {
              areaId: item.areaId,
              plantIndex: item.plantIndex !== undefined ? item.plantIndex : -1
            };
          });
          setDeviceAreaMap(mapping);
        }
      } catch (error) {
        console.error('Error fetching devices and areas:', error);
      }
    };
    
    fetchDevicesAndAreas();
  }, []);
  
  // Cập nhật giá trị độ ẩm đất hiện tại từ sensor
  useEffect(() => {
    const updateCurrentMoisture = async () => {
      try {
        // Sử dụng service với deviceId
        const soilMoistureValue = await getAdafruitFeedData('sensor-soil', selectedDevice);
        if (soilMoistureValue !== null) {
          setCurrentSoilMoisture(parseInt(soilMoistureValue, 10));
        }
      } catch (error) {
        console.error(`Error updating current moisture for device ${selectedDevice}:`, error);
      }
    };
    
    if (selectedDevice) {
      updateCurrentMoisture();
      const intervalId = setInterval(updateCurrentMoisture, 10000);
      return () => clearInterval(intervalId);
    }
  }, [selectedDevice]);
  
  // Logic để tự động điều khiển máy bơm dựa trên ngưỡng độ ẩm
  useEffect(() => {
    const autoControlPump = async () => {
      if (isAutoMode && isThresholdActive) {
        try {
          if (currentSoilMoisture < moistureThreshold) {
            // Độ ẩm dưới ngưỡng -> bật bơm
            await sendCommand('pump-motor', 1);
            setIsPumpActive(true);
          } else {
            // Độ ẩm đạt ngưỡng -> tắt bơm
            await sendCommand('pump-motor', 0);
            setIsPumpActive(false);
          }
        } catch (error) {
          console.error('Error auto controlling pump:', error);
        }
      }
    };
    
    autoControlPump();
  }, [isAutoMode, isThresholdActive, currentSoilMoisture, moistureThreshold]);

  useEffect(() => {
    if (selectedDevice) {
      console.log(`Đang tải dữ liệu cho thiết bị: ${selectedDevice}`);
      
      // Cập nhật dữ liệu cảm biến cho thiết bị đã chọn
      const updateDeviceSensors = async () => {
        try {
          const [temp, humidity, soil] = await Promise.all([
            getAdafruitFeedData('sensor-temp', selectedDevice),
            getAdafruitFeedData('sensor-humidity', selectedDevice),
            getAdafruitFeedData('sensor-soil', selectedDevice)
          ]);
          
          setSensorValues({
            temp: temp !== null ? temp : '--',
            humidity: humidity !== null ? humidity : '--',
            soil: soil !== null ? soil : '--'
          });
          
          // Cập nhật độ ẩm đất hiện tại
          if (soil !== null) {
            setCurrentSoilMoisture(parseInt(soil, 10));
          }
        } catch (error) {
          console.error(`Lỗi khi cập nhật dữ liệu cảm biến cho thiết bị ${selectedDevice}:`, error);
        }
      };
      
      updateDeviceSensors();
    }
  }, [selectedDevice]);

  // Hàm xử lý thay đổi thiết bị
  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };
  
  // Hàm áp dụng ngưỡng độ ẩm
  const applyMoistureThreshold = async () => {
    try {
      // Chuyển sang chế độ tự động với deviceId
      await sendCommand('mode', 0, selectedDevice);
      setIsAutoMode(true);
      setIsThresholdActive(true);
      
      // Kiểm tra độ ẩm hiện tại và điều khiển bơm
      if (currentSoilMoisture < moistureThreshold) {
        await sendCommand('pump-motor', 1, selectedDevice);
        setIsPumpActive(true);
      } else {
        await sendCommand('pump-motor', 0, selectedDevice);
        setIsPumpActive(false);
      }
    } catch (error) {
      console.error(`Error applying moisture threshold for device ${selectedDevice}:`, error);
    }
  };
  
  // Hàm tắt ngưỡng độ ẩm
  const disableMoistureThreshold = async () => {
    try {
      setIsThresholdActive(false);
      // Tắt máy bơm khi tắt chế độ tự động
      await sendCommand('pump-motor', 0, selectedDevice);
      setIsPumpActive(false);
    } catch (error) {
      console.error(`Error disabling moisture threshold for device ${selectedDevice}:`, error);
    }
  };
  
  // Lấy thông tin khu vực và cây trồng của thiết bị được chọn
  const getDeviceAreaAndPlant = () => {
    if (!selectedDevice || !deviceAreaMap[selectedDevice]) {
      return { areaName: '', plantName: '', moistureNeeded: 0 };
    }
    
    const mapping = deviceAreaMap[selectedDevice];
    const area = areas.find(a => a._id === mapping.areaId);
    
    if (!area) {
      return { areaName: '', plantName: '', moistureNeeded: 0 };
    }
    
    let plantName = '';
    let moistureNeeded = 0;
    let moistureMaxThreshold = 0;
    
    if (mapping.plantIndex >= 0 && area.plants && area.plants[mapping.plantIndex]) {
      plantName = area.plants[mapping.plantIndex].name;
      moistureNeeded = area.plants[mapping.plantIndex].moistureThreshold.min || 60;
      moistureMaxThreshold = area.plants[mapping.plantIndex].moistureThreshold.max || 80; 
    }
    
    return {
      areaName: area.name,
      plantName,
      moistureNeeded,
      moistureMaxThreshold
    };
  };
  
  // Thông tin thiết bị, khu vực và cây trồng
  const deviceInfo = getDeviceAreaAndPlant();
  const selectedDeviceInfo = devices.find(d => d.deviceId === selectedDevice);

  return (
    <Box>
      <Header theme={muiTheme}>
        <HeaderTitle theme={muiTheme}>Bảng Điều Khiển</HeaderTitle>
      </Header>
      
      {/* Phần chọn thiết bị và hiển thị thông tin */}
      <DeviceSelector theme={muiTheme}>
        <SectionTitle theme={muiTheme}>
          <FaTools /> Chọn thiết bị giám sát
        </SectionTitle>
        
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Thiết bị</InputLabel>
          <Select
            value={selectedDevice}
            onChange={handleDeviceChange}
            label="Thiết bị"
          >
            {devices.map(device => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.deviceName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedDevice && (
          <DeviceInfo theme={muiTheme}>
            <InfoRow theme={muiTheme}>
              <LabelText theme={muiTheme}>Trạng thái:</LabelText>
              <ValueText theme={muiTheme}>
                {selectedDeviceInfo?.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
              </ValueText>
            </InfoRow>
            
            {deviceInfo.areaName && (
              <>
                <InfoRow theme={muiTheme}>
                  <FaMap />
                  <LabelText theme={muiTheme}>Khu vực:</LabelText>
                  <ValueText theme={muiTheme}>{deviceInfo.areaName}</ValueText>
                </InfoRow>
              </>
            )}
            
            {deviceInfo.plantName && (
              <InfoRow theme={muiTheme}>
                <FaLeaf />
                <LabelText theme={muiTheme}>Cây trồng:</LabelText>
                <ValueText theme={muiTheme}>{deviceInfo.plantName}</ValueText>
              </InfoRow>
            )}
            
            {deviceInfo.moistureNeeded > 0 && (
              <InfoRow theme={muiTheme}>
                <FaWater />
                <LabelText theme={muiTheme}>Độ ẩm khuyến nghị:</LabelText>
                <ValueText theme={muiTheme}>
                  {deviceInfo.moistureNeeded}% - {deviceInfo.moistureMaxThreshold}%
                </ValueText>
              </InfoRow>
            )}
          </DeviceInfo>
        )}
      </DeviceSelector>
      
      {/* Quick Stats */}
      <Grid>
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaThermometerHalf /> Nhiệt độ</CardTitle>
          </CardHeader>
          <CardValue theme={muiTheme}>
            {sensorValues.temp}°C
          </CardValue>
        </Card>
        
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaTint /> Độ ẩm không khí</CardTitle>
          </CardHeader>            
          <CardValue theme={muiTheme}>
            {sensorValues.humidity}%
          </CardValue>
        </Card>
        
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaSeedling /> Độ ẩm đất</CardTitle>
          </CardHeader>
          <CardValue theme={muiTheme}>
            {sensorValues.soil}%
          </CardValue>
        </Card>
      </Grid>
      
      {/* Main Content */}
      <Grid>
        {/* Sensor Monitoring */}
        <LargeCard theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}>Biểu đồ cảm biến</CardTitle>
          </CardHeader>
          <SensorChart />
        </LargeCard>
        
        {/* Pump Control */}
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}>
              <FaPowerOff /> Điều khiển bơm
            </CardTitle>
          </CardHeader>
          <PumpControl 
            isAutoThresholdActive={isThresholdActive}
            onEnableAutoThreshold={applyMoistureThreshold}
            onDisableAutoThreshold={disableMoistureThreshold}
            deviceInfo={deviceInfo}
            currentSoilMoisture={currentSoilMoisture}
            areas={areas}
            deviceAreaMap={deviceAreaMap}
            selectedDevice={selectedDevice}
          />
        </Card>
        
        {/* Weather Forecast - Dự báo thời tiết */}
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaCloudSun /> Dự báo thời tiết</CardTitle>
          </CardHeader>
          <WeatherForecast />
        </Card>
        
        {/* Các phần hiển thị khác có thể giữ nguyên */}
      </Grid>
    </Box>
  );
};

export default Dashboard;