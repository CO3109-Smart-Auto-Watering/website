  import React, { useState, useEffect } from 'react';
  import styled from 'styled-components';
  import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
  import { FaThermometerHalf, FaTint, FaSeedling, FaPrint, FaRegCalendarAlt, 
    FaPowerOff, FaMap, FaSlidersH, FaCloudSun, FaMapMarkedAlt, FaLeaf, 
    FaChartLine, FaWater, FaTools } from 'react-icons/fa';

  // Images
  import caiThiaImage from '../../assets/images/plants/caithia.png';
  import caChuaImage from '../../assets/images/plants/cachua.png';
  import hoaHongImage from '../../assets/images/plants/hoahong.png';

  import AdafruitData from './AdafruitData';
  import SensorChart from './SensorChart';
  import PumpControl from './PumpControl';
  import WeatherForecast from './WeatherForecast';
  import PumpSchedule from './PumpSchedule';

  // Styled Components
  const DashboardContainer = styled.div`
    display: flex;
    width: 100%;
    min-height: 100vh;
    background: #f8f9fc;
  `;

  const Sidebar = styled.div`
  width: 260px;
  background: #4975d1;
  color: white;
  padding: 24px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  @media print {
    display: none; /* Hide sidebar when printing */
  }
`;

  const SidebarHeader = styled.div`
    padding: 0 24px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  `;

  const Logo = styled.h1`
    font-size: 22px;
    margin: 0;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 12px;
    }
  `;

  const MainContent = styled.div`
    flex: 1;
    padding: 32px;
    overflow-y: auto;
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
    color: #333;
  `;

  const PrintButton = styled.button`
    display: flex;
    align-items: center;
    background: #4975d1;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    font-size: 15px;
    transition: background 0.2s;
    
    &:hover {
      background: #3a66c2;
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
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
    color: #333;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 8px;
      color: #4975d1;
    }
  `;

  const CardValue = styled.div`
    font-size: 32px;
    font-weight: 600;
    color: #333;
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
    border: 2px solid ${props => props.$active ? '#4975d1' : '#e0e0e0'};
    background: ${props => props.$active ? 'rgba(73, 117, 209, 0.1)' : 'white'};
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    color: ${props => props.$active ? '#4975d1' : '#666'};
    transition: all 0.2s;
    
    &:hover {
      border-color: #4975d1;
      color: #4975d1;
    }
  `;

  const PumpControlButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${props => props.$active ? '#4975d1' : '#f5f5f5'};
    color: ${props => props.$active ? 'white' : '#666'};
    border: none;
    cursor: pointer;
    font-size: 18px;
    margin-top: 16px;
    transition: all 0.2s;
    
    &:hover {
      background: ${props => props.$active ? '#3a66c2' : '#e0e0e0'};
    }
  `;

  const ScheduleList = styled.div`
    margin-top: 16px;
    max-height: 250px;
    overflow-y: auto;
  `;

  const ScheduleItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  `;

  const ScheduleTime = styled.div`
    font-weight: 500;
  `;

  const ScheduleDuration = styled.div`
    color: #666;
  `;

  const ScheduleActions = styled.div`
    display: flex;
    gap: 8px;
  `;

  const IconButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    font-size: 16px;
    padding: 4px;
    
    &:hover {
      color: #4975d1;
    }
  `;

  const AddButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    background: #f5f5f5;
    border: 1px dashed #ccc;
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
    cursor: pointer;
    font-size: 15px;
    color: #666;
    transition: all 0.2s;
    
    &:hover {
      background: #e9ecef;
      color: #4975d1;
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
    background: ${props => props.$active ? 'rgba(73, 117, 209, 0.1)' : '#f8f9fc'};
    border: 1px solid ${props => props.$active ? '#4975d1' : '#e0e0e0'};
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: #4975d1;
    }
  `;

  const ZoneName = styled.div`
    font-weight: 500;
    margin-bottom: 4px;
  `;

  const ZoneInfo = styled.div`
    font-size: 14px;
    color: #666;
  `;

  const AddZoneButton = styled(AddButton)`
    grid-column: span 2;
  `;

  const ThresholdForm = styled.div`
    margin-top: 16px;
  `;

  const ThresholdItem = styled.div`
    margin-bottom: 16px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
  `;

  const ThresholdValue = styled.div`
    text-align: right;
    font-weight: 500;
    color: #4975d1;
    margin-top: 4px;
  `;

  const RangeSlider = styled.input.attrs({ type: 'range' })`
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    background: #e0e0e0;
    border-radius: 3px;
    outline: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4975d1;
      cursor: pointer;
    }
  `;

  const SaveButton = styled.button`
    background: #4975d1;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
      background: #3a66c2;
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
    background: ${props => props.$type === 'warning' ? 'rgba(255, 152, 0, 0.05)' : 'rgba(33, 150, 243, 0.05)'};
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
  `;

  const NotificationMessage = styled.div`
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
  `;

  const NotificationTime = styled.div`
    font-size: 12px;
    color: #999;
  `;

  const DismissButton = styled.button`
    background: none;
    border: none;
    color: #999;
    font-size: 18px;
    cursor: pointer;
    
    &:hover {
      color: #666;
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
    border-bottom: 1px solid #f0f0f0;
    
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
  `;

  const PlantDetails = styled.div`
    font-size: 13px;
    color: #666;
  `;

  const PlantMenu = styled.div`
    
  `;

  const AddPlantButton = styled(AddButton)``;

  const EfficiencyStats = styled.div`
    display: flex;
    justify-content: space-around;
    margin: 16px 0 24px;
  `;

  const StatItem = styled.div`
    text-align: center;
  `;

  const StatValue = styled.div`
    font-size: 24px;
    font-weight: 600;
    color: #4975d1;
  `;

  const StatLabel = styled.div`
    font-size: 14px;
    color: #666;
    margin-top: 4px;
  `;

  const FilterSelect = styled.select`
    padding: 6px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    color: #666;
  `;

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
    background: ${props => props.$active ? 'rgba(73, 117, 209, 0.1)' : '#f8f9fc'};
    border: 1px solid ${props => props.$active ? '#4975d1' : '#e0e0e0'};
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: #4975d1;
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
  `;

  const ModeDescription = styled.div`
    font-size: 13px;
    color: #666;
  `;

  const DeviceList = styled.div`
    margin-top: 16px;
  `;

  const DeviceItem = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  `;

  const DeviceIcon = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.status === 'online' ? '#27ae60' : props.status === 'offline' ? '#e74c3c' : '#f39c12'};
    margin-right: 12px;
  `;

  const DeviceInfo = styled.div`
    flex: 1;
  `;

  const DeviceName = styled.div`
    font-weight: 500;
  `;

  const DeviceStatus = styled.div`
    font-size: 13px;
    color: ${props => props.status === 'online' ? '#27ae60' : props.status === 'offline' ? '#e74c3c' : '#f39c12'};
  `;

  const DeviceBattery = styled.div`
    font-weight: 500;
  `;

  const MaintenanceAlert = styled.div`
    margin-top: 16px;
    padding: 16px;
    background: ${props => props.$show ? 'rgba(255, 152, 0, 0.1)' : 'transparent'};
    border: 1px solid ${props => props.$show ? '#f39c12' : 'transparent'};
    border-radius: 8px;
    display: ${props => props.$show ? 'flex' : 'none'};
    align-items: flex-start;
  `;

  const AlertIcon = styled.div`
    font-size: 20px;
    margin-right: 12px;
  `;

  const AlertText = styled.div`
    flex: 1;
    font-size: 14px;
  `;

  const AlertButton = styled(SaveButton)`
    margin-left: 12px;
    padding: 6px 12px;
    font-size: 13px;
  `;

  // Mock data cho các tính năng mới
  const zones = [
    { id: 1, name: 'Vườn trước', moisture: 62, active: true },
    { id: 2, name: 'Vườn sau', moisture: 48, active: false },
    { id: 3, name: 'Khu rau', moisture: 71, active: false },
    { id: 4, name: 'Khu hoa', moisture: 55, active: false },
  ];

  const notifications = [
    { 
      id: 1, 
      type: 'warning', 
      title: 'Độ ẩm đất thấp', 
      message: 'Khu vực "Vườn sau" có độ ẩm đất xuống dưới 50%', 
      time: 'Vừa xong' 
    },
    { 
      id: 2, 
      type: 'info', 
      title: 'Hoàn thành lịch trình', 
      message: 'Đã hoàn thành tưới theo lịch trình lúc 18:00', 
      time: '20 phút trước' 
    },
  ];

  const plants = [
    { id: 1, name: 'Cải thìa', image: caiThiaImage, moistureNeeded: 65 },
    { id: 2, name: 'Cà chua', image: caChuaImage, moistureNeeded: 60 },
    { id: 3, name: 'Hoa hồng', image: hoaHongImage, moistureNeeded: 50 },
  ];

  const efficiencyData = [
    { date: 'T2', waterSaved: 30, energySaved: 25 },
    { date: 'T3', waterSaved: 32, energySaved: 27 },
    { date: 'T4', waterSaved: 35, energySaved: 30 },
    { date: 'T5', waterSaved: 38, energySaved: 28 },
    { date: 'T6', waterSaved: 36, energySaved: 27 },
    { date: 'T7', waterSaved: 32, energySaved: 26 },
    { date: 'CN', waterSaved: 34, energySaved: 29 },
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

  const schedules = [
    { id: 1, time: '06:00', duration: '15 phút', active: true },
    { id: 2, time: '18:00', duration: '20 phút', active: true },
    { id: 3, time: '22:00', duration: '10 phút', active: false },
  ];

  const Dashboard = () => {

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

    const handlePrintReport = () => {
      window.print();
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

    return (
      <DashboardContainer>
        <Sidebar>
          <SidebarHeader>
            <Logo>
              <FaSeedling /> Smart Garden
            </Logo>
          </SidebarHeader>
        </Sidebar>

        <MainContent>
          <Header>
            <HeaderTitle>Bảng Điều Khiển</HeaderTitle>
            <PrintButton onClick={handlePrintReport}>
              <FaPrint /> In báo cáo
            </PrintButton>
          </Header>
          
          {/* Quick Stats */}
          <Grid>
            <Card>
              <CardHeader>
                <CardTitle><FaThermometerHalf /> Nhiệt độ</CardTitle>
              </CardHeader>
              <CardValue>
                <AdafruitData feedName="sensor-temp" />°C
              </CardValue>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle><FaTint /> Độ ẩm không khí</CardTitle>
              </CardHeader>            
              <CardValue>
                <AdafruitData feedName="sensor-humidity" />%
              </CardValue>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle><FaSeedling /> Độ ẩm đất</CardTitle>
              </CardHeader>
              <CardValue>
                <AdafruitData feedName="sensor-soil" />%
              </CardValue>
            </Card>
          </Grid>
          
          {/* Main Content */}
          <Grid>
            {/* Sensor Monitoring */}
            <LargeCard>
              <CardHeader>
                <CardTitle>Biểu đồ cảm biến</CardTitle>
              </CardHeader>
              <SensorChart />
            </LargeCard>
            
            {/* Pump Control */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <FaPowerOff /> Điều khiển bơm
                </CardTitle>
              </CardHeader>
              <PumpControl />
            </Card>
            
            {/* Pump Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thời gian hoạt động</CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pumpStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
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
            
            {/* Irrigation Schedule */}
            <Card>
              <CardHeader>
                <CardTitle><FaRegCalendarAlt /> Lịch trình tưới</CardTitle>
              </CardHeader>
              <PumpSchedule />
            </Card>

            {/* Zone Management - Tính năng quản lý khu vực */}
            <Card>
              <CardHeader>
                <CardTitle><FaMap /> Quản lý khu vực</CardTitle>
              </CardHeader>
              <ZoneGrid>
                {zones.map(zone => (
                  <ZoneItem key={zone.id} $active={selectedZone === zone.id} onClick={() => selectZone(zone.id)}>
                    <ZoneName>{zone.name}</ZoneName>
                    <ZoneInfo>Độ ẩm: {zone.moisture}%</ZoneInfo>
                  </ZoneItem>
                ))}
                <AddZoneButton>+ Thêm khu vực</AddZoneButton>
              </ZoneGrid>
            </Card>


            {/* Weather Forecast - Dự báo thời tiết */}
            <Card>
              <CardHeader>
                <CardTitle><FaCloudSun /> Dự báo thời tiết</CardTitle>
              </CardHeader>
              <WeatherForecast />
            </Card>
            {/* Plant Management - Quản lý cây trồng */}
            <Card>
              <CardHeader>
                <CardTitle><FaLeaf /> Cây trồng</CardTitle>
              </CardHeader>
              <PlantsList>
                {plants.map(plant => (
                  <PlantItem key={plant.id}>
                    <PlantImage src={plant.image} alt={plant.name} />
                    <PlantInfo>
                      <PlantName>{plant.name}</PlantName>
                      <PlantDetails>Độ ẩm yêu cầu: {plant.moistureNeeded}%</PlantDetails>
                    </PlantInfo>
                    <PlantMenu>
                      <IconButton>⋮</IconButton>
                    </PlantMenu>
                  </PlantItem>
                ))}
              </PlantsList>
              <AddPlantButton>+ Thêm cây trồng</AddPlantButton>
            </Card>

            {/* Efficiency Analysis - Phân tích hiệu quả */}
            <LargeCard>
              <CardHeader>
                <CardTitle><FaChartLine /> Phân tích hiệu quả</CardTitle>
                <FilterSelect>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                </FilterSelect>
              </CardHeader>
              <EfficiencyStats>
                <StatItem>
                  <StatValue>35%</StatValue>
                  <StatLabel>Tiết kiệm nước</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>42%</StatValue>
                  <StatLabel>Tăng độ ẩm đất</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>28%</StatValue>
                  <StatLabel>Tiết kiệm điện</StatLabel>
                </StatItem>
              </EfficiencyStats>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="waterSaved" stroke="#3498db" name="Tiết kiệm nước (%)" />
                  <Line type="monotone" dataKey="energySaved" stroke="#2ecc71" name="Tiết kiệm điện (%)" />
                </LineChart>
              </ResponsiveContainer>
            </LargeCard>

            {/* Advanced Irrigation Modes - Chế độ tưới nâng cao */}
            <Card>
              <CardHeader>
                <CardTitle><FaWater /> Chế độ tưới thông minh</CardTitle>
              </CardHeader>
              <IrrigationModes>
                <ModeItem $active={irrigationMode === 'eco'} onClick={() => setIrrigationMode('eco')}>
                  <ModeIcon>🌱</ModeIcon>
                  <ModeContent>
                    <ModeName>Tiết kiệm</ModeName>
                    <ModeDescription>Tối ưu hóa lượng nước, tưới ít và thường xuyên</ModeDescription>
                  </ModeContent>
                </ModeItem>
                <ModeItem $active={irrigationMode === 'balanced'} onClick={() => setIrrigationMode('balanced')}>
                  <ModeIcon>⚖️</ModeIcon>
                  <ModeContent>
                    <ModeName>Cân bằng</ModeName>
                    <ModeDescription>Cân đối giữa tiết kiệm và hiệu quả tưới</ModeDescription>
                  </ModeContent>
                </ModeItem>
                <ModeItem $active={irrigationMode === 'intensive'} onClick={() => setIrrigationMode('intensive')}>
                  <ModeIcon>💦</ModeIcon>
                  <ModeContent>
                    <ModeName>Tăng cường</ModeName>
                    <ModeDescription>Tưới nhiều hơn cho cây mới trồng hoặc thời tiết nóng</ModeDescription>
                  </ModeContent>
                </ModeItem>
              </IrrigationModes>
            </Card>

            {/* Device Management - Quản lý thiết bị */}
            <Card>
              <CardHeader>
                <CardTitle><FaTools /> Quản lý thiết bị</CardTitle>
              </CardHeader>
              <DeviceList>
                {devices.map(device => (
                  <DeviceItem key={device.id}>
                    <DeviceIcon status={device.status} />
                    <DeviceInfo>
                      <DeviceName>{device.name}</DeviceName>
                      <DeviceStatus status={device.status}>
                        {device.status === 'online' ? 'Đang hoạt động' : 
                        device.status === 'offline' ? 'Mất kết nối' : 'Cần bảo trì'}
                      </DeviceStatus>
                    </DeviceInfo>
                    <DeviceBattery>{device.battery}%</DeviceBattery>
                  </DeviceItem>
                ))}
              </DeviceList>
              <MaintenanceAlert $show={maintenanceNeeded}>
                <AlertIcon>⚠️</AlertIcon>
                <AlertText>Đã 30 ngày kể từ lần bảo trì lọc nước gần nhất. Hãy làm sạch lọc để đảm bảo hiệu suất tốt nhất.</AlertText>
                <AlertButton>Xác nhận bảo trì</AlertButton>
              </MaintenanceAlert>
            </Card>

            {/* Notifications - Thông báo */}
            <Card>
              <CardHeader>
                <CardTitle>Thông báo</CardTitle>
              </CardHeader>
              <NotificationCenter>
                {notifications.map(notification => (
                  <NotificationItem key={notification.id} $type={notification.type}>
                    <NotificationIcon>{notification.type === 'warning' ? '⚠️' : 'ℹ️'}</NotificationIcon>
                    <NotificationContent>
                      <NotificationTitle>{notification.title}</NotificationTitle>
                      <NotificationMessage>{notification.message}</NotificationMessage>
                      <NotificationTime>{notification.time}</NotificationTime>
                    </NotificationContent>
                    <DismissButton onClick={() => dismissNotification(notification.id)}>×</DismissButton>
                  </NotificationItem>
                ))}
              </NotificationCenter>
            </Card>
          </Grid>
        </MainContent>
      </DashboardContainer>
    );
  };

  export default Dashboard;