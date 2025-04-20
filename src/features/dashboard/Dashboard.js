import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FaThermometerHalf, FaTint, FaSeedling, FaPowerOff, FaMap, FaLeaf, 
  FaChartLine, FaWater, FaTools, FaCloudSun } from 'react-icons/fa';
import { Box, useTheme, FormControl, InputLabel, MenuItem, Select, Typography, 
  Alert, Snackbar } from '@mui/material';

import SensorChart from './SensorChart';
import PumpControl from './PumpControl';
import WeatherForecast from './WeatherForecast';
import { getUserDevices, getDeviceAreaMapping } from '../../services/deviceService';
import { getAreas } from '../../services/areaService';
import { sendCommand, getAdafruitFeedData, setActiveDevice } from '../../services/sensorService';

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
  const [devices, setDevices] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(''); // Thay selectedDevice bằng selectedPlant
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [plantList, setPlantList] = useState([]); // Danh sách cây trồng kèm khu vực

  // Lấy thông tin khu vực và cây trồng
  const getDeviceAreaAndPlant = () => {
    if (!selectedPlant || !plantList.length) {
      return { areaName: '', plantName: '', moistureNeeded: 0, moistureMaxThreshold: 0, deviceId: '' };
    }
    
    const selected = plantList.find(p => `${p.areaId}_${p.plantIndex}` === selectedPlant);
    if (!selected) {
      return { areaName: '', plantName: '', moistureNeeded: 0, moistureMaxThreshold: 0, deviceId: '' };
    }

    const area = areas.find(a => a._id === selected.areaId);
    const plant = area?.plants?.[selected.plantIndex];
    
    return {
      areaName: area?.name || '',
      plantName: plant?.name || '',
      moistureNeeded: plant?.moistureThreshold?.min || 60,
      moistureMaxThreshold: plant?.moistureThreshold?.max || 80,
      deviceId: selected.deviceId || ''
    };
  };

  const deviceInfo = useMemo(() => getDeviceAreaAndPlant(), [selectedPlant, plantList, areas]);
  const selectedDeviceInfo = useMemo(() => devices.find(d => d.deviceId === deviceInfo.deviceId), [devices, deviceInfo.deviceId]);

  // Load devices, areas, mappings, and build plant list
  useEffect(() => {
    const fetchDevicesAndAreas = async () => {
      try {
        const devicesResponse = await getUserDevices();
        if (devicesResponse.success) {
          console.log('Fetched devices:', devicesResponse.devices);
          setDevices(devicesResponse.devices);
        }

        const areasResponse = await getAreas();
        if (areasResponse.success) {
          setAreas(areasResponse.areas);
        }

        const mappingsResponse = await getDeviceAreaMapping();
        if (mappingsResponse.success) {
          const mapping = {};
          mappingsResponse.mappings.forEach(item => {
            mapping[item.deviceId] = {
              areaId: item.areaId,
              plantIndex: item.plantIndex !== undefined ? item.plantIndex : -1
            };
          });
          setDeviceAreaMap(mapping);

          // Xây dựng danh sách cây trồng
          const plants = [];
          mappingsResponse.mappings.forEach(item => {
            if (item.plantIndex >= 0) {
              const area = areasResponse.areas.find(a => a._id === item.areaId);
              if (area && area.plants && area.plants[item.plantIndex]) {
                plants.push({
                  areaId: item.areaId,
                  areaName: area.name,
                  plantIndex: item.plantIndex,
                  plantName: area.plants[item.plantIndex].name,
                  deviceId: item.deviceId
                });
              }
            }
          });
          setPlantList(plants);
          if (plants.length > 0) {
            setSelectedPlant(`${plants[0].areaId}_${plants[0].plantIndex}`);
          }
        }
      } catch (error) {
        console.error('Error fetching devices and areas:', error);
        setSnackbar({ open: true, message: 'Lỗi khi tải danh sách thiết bị và khu vực', severity: 'error' });
      }
    };

    fetchDevicesAndAreas();
  }, []);

  // Cập nhật dữ liệu cảm biến
  useEffect(() => {
    if (!deviceInfo.deviceId) return;

    const updateSensorValues = async () => {
      try {
        const [temp, humidity, soil] = await Promise.all([
          getAdafruitFeedData('sensor-temp', deviceInfo.deviceId),
          getAdafruitFeedData('sensor-humidity', deviceInfo.deviceId),
          getAdafruitFeedData('sensor-soil', deviceInfo.deviceId)
        ]);

        setSensorValues({
          temp: temp !== null ? temp : '--',
          humidity: humidity !== null ? humidity : '--',
          soil: soil !== null ? soil : '--'
        });

        if (soil !== null) {
          setCurrentSoilMoisture(parseInt(soil, 10));
        }

        const pumpStatus = await getAdafruitFeedData('pump-motor', deviceInfo.deviceId);
        setIsPumpActive(pumpStatus === '1');
        setSnackbar({ open: false, message: '', severity: 'info' });
      } catch (error) {
        console.error(`Error fetching sensor values for device ${deviceInfo.deviceId}:`, error);
        setSnackbar({ open: true, message: `Lỗi khi lấy dữ liệu cho thiết bị ${deviceInfo.deviceId}`, severity: 'error' });
      }
    };

    updateSensorValues();
    const intervalId = setInterval(updateSensorValues, 10000);
    return () => clearInterval(intervalId);
  }, [deviceInfo.deviceId]);

  // Handle plant change
  const handlePlantChange = async (event) => {
    const newPlantKey = event.target.value;
    console.log('Selected plant:', newPlantKey);

    const selected = plantList.find(p => `${p.areaId}_${p.plantIndex}` === newPlantKey);
    if (!selected) {
      setSnackbar({ open: true, message: 'Cây trồng không hợp lệ', severity: 'error' });
      return;
    }

    try {
      const result = await setActiveDevice(selected.deviceId);
      console.log('setActiveDevice response:', result);
      if (result.success) {
        setSelectedPlant(newPlantKey);
        setSnackbar({ open: true, message: `Đã chọn cây ${selected.plantName} - ${selected.areaName}`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: `Lỗi khi chọn thiết bị ${selected.deviceId}: ${result.message}`, severity: 'error' });
      }
    } catch (error) {
      console.error('Error setting active device:', error);
      setSnackbar({ open: true, message: `Lỗi khi chọn thiết bị ${selected.deviceId}`, severity: 'error' });
    }
  };

  // Apply moisture threshold
  const applyMoistureThreshold = async () => {
    try {
      await sendCommand('mode', 0, deviceInfo.deviceId);
      setIsAutoMode(true);
      setIsThresholdActive(true);

      if (currentSoilMoisture < moistureThreshold) {
        //await sendCommand('pump-motor', 1, deviceInfo.deviceId);
        setIsPumpActive(true);
      } else {
        //await sendCommand('pump-motor', 0, deviceInfo.deviceId);
        setIsPumpActive(false);
      }
      setSnackbar({ open: true, message: 'Đã áp dụng ngưỡng độ ẩm', severity: 'success' });
    } catch (error) {
      console.error(`Error applying moisture threshold for device ${deviceInfo.deviceId}:`, error);
      setSnackbar({ open: true, message: `Lỗi khi áp dụng ngưỡng độ ẩm cho thiết bị ${deviceInfo.deviceId}`, severity: 'error' });
    }
  };

  // Disable moisture threshold
  const disableMoistureThreshold = async () => {
    try {
      setIsThresholdActive(false);
      //await sendCommand('pump-motor', 0, deviceInfo.deviceId);
      setIsPumpActive(false);
      setSnackbar({ open: true, message: 'Đã tắt ngưỡng độ ẩm', severity: 'success' });
    } catch (error) {
      console.error(`Error disabling moisture threshold for device ${deviceInfo.deviceId}:`, error);
      setSnackbar({ open: true, message: `Lỗi khi tắt ngưỡng độ ẩm cho thiết bị ${deviceInfo.deviceId}`, severity: 'error' });
    }
  };

  return (
    <Box>
      <Header theme={muiTheme}>
        <HeaderTitle theme={muiTheme}>Bảng Điều Khiển</HeaderTitle>
      </Header>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Plant Selector */}
      <DeviceSelector theme={muiTheme}>
        <SectionTitle theme={muiTheme}>
          <FaLeaf /> Chọn cây trồng để giám sát
        </SectionTitle>
        
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Cây trồng</InputLabel>
          <Select
            value={selectedPlant}
            onChange={handlePlantChange}
            label="Cây trồng"
          >
            {plantList.map(plant => (
              <MenuItem 
                key={`${plant.areaId}_${plant.plantIndex}`} 
                value={`${plant.areaId}_${plant.plantIndex}`}
              >
                {plant.plantName} - {plant.areaName} ({plant.deviceId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedPlant && (
          <DeviceInfo theme={muiTheme}>
            <InfoRow theme={muiTheme}>
              <LabelText theme={muiTheme}>Thiết bị:</LabelText>
              <ValueText theme={muiTheme}>
                {deviceInfo.deviceId} {selectedDeviceInfo?.isActive ? '(Đang theo dõi)' : '(Không hoạt động)'}
              </ValueText>
            </InfoRow>
            
            {deviceInfo.areaName && (
              <InfoRow theme={muiTheme}>
                <FaMap />
                <LabelText theme={muiTheme}>Khu vực:</LabelText>
                <ValueText theme={muiTheme}>{deviceInfo.areaName}</ValueText>
              </InfoRow>
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
        <LargeCard theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}>
              <FaChartLine /> Biểu đồ cảm biến {deviceInfo.deviceId ? `- ${deviceInfo.deviceId}` : ''}
            </CardTitle>
          </CardHeader>
          <SensorChart selectedDevice={deviceInfo.deviceId} />
        </LargeCard>

        <LargeCard theme={muiTheme}>
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
            selectedDevice={deviceInfo.deviceId}
          />
        </LargeCard>

        <LargeCard theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaCloudSun /> Dự báo thời tiết</CardTitle>
          </CardHeader>
          <WeatherForecast />
        </LargeCard>
      </Grid>
    </Box>
  );
};

export default Dashboard;
