import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaThermometerHalf, FaTint, FaSeedling, FaPrint, FaRegCalendarAlt, 
  FaPowerOff, FaMap, FaSlidersH, FaCloudSun, FaMapMarkedAlt, FaLeaf, 
  FaChartLine, FaWater, FaTools } from 'react-icons/fa';
import { Box, useTheme } from '@mui/material';

// Images
import caiThiaImage from '../../assets/images/plants/caithia.png';
import caChuaImage from '../../assets/images/plants/cachua.png';
import hoaHongImage from '../../assets/images/plants/hoahong.png';

import AdafruitData from './AdafruitData';
import SensorChart from './SensorChart';
import PumpControl from './PumpControl';
import WeatherForecast from './WeatherForecast';

// Styled Components using theme
const Logo = styled.h1`
  font-size: 22px;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 28px;
  color: ${props => props.theme.palette.text.primary};
`;

const PrintButton = styled.button`
  display: flex;
  align-items: center;
  background: ${props => props.theme.palette.primary.main};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.theme.palette.primary.dark};
  }
  
  svg {
    margin-right: 8px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const Card = styled.div`
  background: ${props => props.theme.palette.background.paper};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${props => props.theme.palette.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const LargeCard = styled(Card)`
  grid-column: span 3;
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: ${props => props.theme.palette.text.primary};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: ${props => props.theme.palette.primary.main};
  }
`;

const CardValue = styled.div`
  font-size: 32px;
  font-weight: 600;
  color: ${props => props.theme.palette.text.primary};
  margin-top: 12px;
`;

const PumpControlContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

const PumpModeButton = styled.button`
  flex: 1;
  padding: 14px;
  border: 2px solid ${props => props.$active 
    ? props.theme.palette.primary.main 
    : props.theme.palette.divider};
  background: ${props => props.$active 
    ? `${props.theme.palette.primary.main}20` 
    : props.theme.palette.background.paper};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: ${props => props.$active 
    ? props.theme.palette.primary.main 
    : props.theme.palette.text.secondary};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.theme.palette.primary.main};
    color: ${props => props.theme.palette.primary.main};
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.palette.text.secondary};
  font-size: 16px;
  padding: 4px;
  
  &:hover {
    color: ${props => props.theme.palette.primary.main};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: ${props => props.theme.palette.mode === 'dark' 
    ? props.theme.palette.background.default
    : '#f5f5f5'};
  border: 1px dashed ${props => props.theme.palette.divider};
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  cursor: pointer;
  font-size: 15px;
  color: ${props => props.theme.palette.text.secondary};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.theme.palette.action.hover};
    color: ${props => props.theme.palette.primary.main};
  }
`;

// Styled components cho các tính năng mới
const ZoneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
`;

const ZoneItem = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.$active 
    ? `${props.theme.palette.primary.main}20` 
    : props.theme.palette.mode === 'dark'
      ? props.theme.palette.background.default
      : '#f8f9fc'};
  border: 1px solid ${props => props.$active 
    ? props.theme.palette.primary.main 
    : props.theme.palette.divider};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.theme.palette.primary.main};
  }
`;

const ZoneName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ZoneInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.palette.text.secondary};
`;

const AddZoneButton = styled(AddButton)`
  grid-column: span 2;
`;

const SaveButton = styled.button`
  background: ${props => props.theme.palette.primary.main};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.theme.palette.primary.dark};
  }
`;

const NotificationCenter = styled.div`
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: ${props => props.$type === 'warning' 
    ? 'rgba(255, 152, 0, 0.05)' 
    : 'rgba(33, 150, 243, 0.05)'};
  background: ${props => props.$type === 'warning' 
    ? props.theme.palette.mode === 'dark'
      ? 'rgba(255, 152, 0, 0.15)'
      : 'rgba(255, 152, 0, 0.05)'
    : props.theme.palette.mode === 'dark'
      ? 'rgba(33, 150, 243, 0.15)'
      : 'rgba(33, 150, 243, 0.05)'};
  border-left: 4px solid ${props => props.$type === 'warning' ? '#f39c12' : '#2196f3'};
  border-radius: 4px;
  margin-bottom: 12px;
`;

const NotificationIcon = styled.div`
  margin-right: 12px;
  font-size: 20px;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  color: ${props => props.theme.palette.text.primary};
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 4px;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: ${props => props.theme.palette.text.disabled};
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.palette.text.disabled};
  font-size: 18px;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const PlantsList = styled.div`
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const PlantItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  
  &:last-child {
    border-bottom: none;
  }
`;

const PlantImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 12px;
`;

const PlantInfo = styled.div`
  flex: 1;
`;

const PlantName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.palette.text.primary};
`;

const PlantDetails = styled.div`
  font-size: 13px;
  color: ${props => props.theme.palette.text.secondary};
`;

const PlantMenu = styled.div``;

const AddPlantButton = styled(AddButton)``;

const IrrigationModes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const ModeItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.$active 
    ? `${props.theme.palette.primary.main}20` 
    : props.theme.palette.mode === 'dark'
      ? props.theme.palette.background.default
      : '#f8f9fc'};
  border: 1px solid ${props => props.$active 
    ? props.theme.palette.primary.main 
    : props.theme.palette.divider};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.theme.palette.primary.main};
  }
`;

const ModeIcon = styled.div`
  font-size: 24px;
  margin-right: 12px;
`;

const ModeContent = styled.div`
  flex: 1;
`;

const ModeName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  color: ${props => props.theme.palette.text.primary};
`;

const ModeDescription = styled.div`
  font-size: 13px;
  color: ${props => props.theme.palette.text.secondary};
`;


// Mock data cho các tính năng mới
const zones = [
  { id: 1, name: 'Vườn trước', moisture: 62, active: true },
  { id: 2, name: 'Vườn sau', moisture: 48, active: false },
  { id: 3, name: 'Khu rau', moisture: 71, active: false },
  { id: 4, name: 'Khu hoa', moisture: 55, active: false },
];

const plants = [
  { id: 1, name: 'Cải thìa', image: caiThiaImage, moistureNeeded: 65 },
  { id: 2, name: 'Cà chua', image: caChuaImage, moistureNeeded: 60 },
  { id: 3, name: 'Hoa hồng', image: hoaHongImage, moistureNeeded: 50 },
];

const devices = [
  { id: 1, name: 'Cảm biến nhiệt độ', status: 'online', battery: 72 },
  { id: 2, name: 'Cảm biến ẩm 1', status: 'online', battery: 85 },
  { id: 3, name: 'Cảm biến ẩm 2', status: 'maintenance', battery: 45 },
  { id: 4, name: 'Van nước 1', status: 'offline', battery: 12 },
];

const pumpStats = [
  { name: 'Tự động', value: 75 },
  { name: 'Thủ công', value: 25 },
];

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

  // Hàm cho các tính năng hiện có
  const togglePump = () => {
    if (pumpMode === 'manual') {
      setIsPumpActive(!isPumpActive);
    }
  };

  // Hàm cho các tính năng mới
  const selectZone = (zoneId) => {
    setSelectedZone(zoneId);
  };

  const updateThreshold = (type, value) => {
    setThresholds({
      ...thresholds,
      [type]: value
    });
  };

  const dismissNotification = (id) => {
    // Xử lý xóa thông báo
  };

  const selectGardenArea = (areaId) => {
    setSelectedArea(areaId);
  };

  const getMoistureColor = (moisture) => {
    if (moisture < 50) return '#e74c3c';
    if (moisture < 65) return '#f39c12';
    return '#27ae60';
  };

  const toggleVoiceControl = () => {
    setIsListening(!isListening);
  };

  // Truyền theme từ MUI vào styled-components
  return (
    <Box>
      <Header theme={muiTheme}>
        <HeaderTitle theme={muiTheme}>Bảng Điều Khiển</HeaderTitle>
      </Header>
      
      {/* Quick Stats */}
      <Grid>
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaThermometerHalf /> Nhiệt độ</CardTitle>
          </CardHeader>
          <CardValue theme={muiTheme}>
            <AdafruitData feedName="sensor-temp" />°C
          </CardValue>
        </Card>
        
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaTint /> Độ ẩm không khí</CardTitle>
          </CardHeader>            
          <CardValue theme={muiTheme}>
            <AdafruitData feedName="sensor-humidity" />%
          </CardValue>
        </Card>
        
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaSeedling /> Độ ẩm đất</CardTitle>
          </CardHeader>
          <CardValue theme={muiTheme}>
            <AdafruitData feedName="sensor-soil" />%
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
          <PumpControl />
        </Card>
        
        {/* Pump Stats */}
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}>Thời gian hoạt động</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pumpStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill={muiTheme.palette.primary.main}
                dataKey="value"
                nameKey="name"
                label
              >
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      
        {/* Zone Management - Tính năng quản lý khu vực */}
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaMap /> Quản lý khu vực</CardTitle>
          </CardHeader>
          <ZoneGrid>
            {zones.map(zone => (
              <ZoneItem 
                key={zone.id} 
                $active={selectedZone === zone.id} 
                onClick={() => selectZone(zone.id)}
                theme={muiTheme}
              >
                <ZoneName theme={muiTheme}>{zone.name}</ZoneName>
                <ZoneInfo theme={muiTheme}>Độ ẩm: {zone.moisture}%</ZoneInfo>
              </ZoneItem>
            ))}
            <AddZoneButton theme={muiTheme}>+ Thêm khu vực</AddZoneButton>
          </ZoneGrid>
        </Card>

        {/* Weather Forecast - Dự báo thời tiết */}
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaCloudSun /> Dự báo thời tiết</CardTitle>
          </CardHeader>
          <WeatherForecast />
        </Card>
        
        {/* Plant Management - Quản lý cây trồng */}
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaLeaf /> Cây trồng</CardTitle>
          </CardHeader>
          <PlantsList theme={muiTheme}>
            {plants.map(plant => (
              <PlantItem key={plant.id} theme={muiTheme}>
                <PlantImage src={plant.image} alt={plant.name} />
                <PlantInfo>
                  <PlantName theme={muiTheme}>{plant.name}</PlantName>
                  <PlantDetails theme={muiTheme}>Độ ẩm yêu cầu: {plant.moistureNeeded}%</PlantDetails>
                </PlantInfo>
                <PlantMenu>
                  <IconButton theme={muiTheme}>⋮</IconButton>
                </PlantMenu>
              </PlantItem>
            ))}
          </PlantsList>
          <AddPlantButton theme={muiTheme}>+ Thêm cây trồng</AddPlantButton>
        </Card>

        {/* Advanced Irrigation Modes - Chế độ tưới nâng cao */}
        <Card theme={muiTheme}>
          <CardHeader theme={muiTheme}>
            <CardTitle theme={muiTheme}><FaWater /> Chế độ tưới thông minh</CardTitle>
          </CardHeader>
          <IrrigationModes>
            <ModeItem 
              $active={irrigationMode === 'eco'} 
              onClick={() => setIrrigationMode('eco')}
              theme={muiTheme}
            >
              <ModeIcon>🌱</ModeIcon>
              <ModeContent>
                <ModeName theme={muiTheme}>Tiết kiệm</ModeName>
                <ModeDescription theme={muiTheme}>Tối ưu hóa lượng nước, tưới ít và thường xuyên</ModeDescription>
              </ModeContent>
            </ModeItem>
            <ModeItem 
              $active={irrigationMode === 'balanced'} 
              onClick={() => setIrrigationMode('balanced')}
              theme={muiTheme}
            >
              <ModeIcon>⚖️</ModeIcon>
              <ModeContent>
                <ModeName theme={muiTheme}>Cân bằng</ModeName>
                <ModeDescription theme={muiTheme}>Cân đối giữa tiết kiệm và hiệu quả tưới</ModeDescription>
              </ModeContent>
            </ModeItem>
            <ModeItem 
              $active={irrigationMode === 'intensive'} 
              onClick={() => setIrrigationMode('intensive')}
              theme={muiTheme}
            >
              <ModeIcon>💦</ModeIcon>
              <ModeContent>
                <ModeName theme={muiTheme}>Tăng cường</ModeName>
                <ModeDescription theme={muiTheme}>Tưới nhiều hơn cho cây mới trồng hoặc thời tiết nóng</ModeDescription>
              </ModeContent>
            </ModeItem>
          </IrrigationModes>
        </Card>
      </Grid>
    </Box>
  );
};

export default Dashboard;