import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  Box, Typography, Button, Divider, Chip, Paper, 
  CircularProgress, Alert, Card, CardContent, Grid, 
  IconButton, Fade, Tooltip, Switch, Snackbar
} from '@mui/material';
import { 
  PowerSettingsNew, SmartToy, Check, Warning, Error as ErrorIcon,
  WaterDrop, Opacity, Grass, Settings, AccessTime, EnergySavingsLeaf,
  ToggleOn, ToggleOff, Info, Notifications
} from '@mui/icons-material';
import { getLatestSensorData, sendCommand, getAdafruitFeedData } from '../../services/sensorService';

// Styled components with theme support
const ControlWrapper = styled(Box)`
  padding: 20px;
  transition: background-color 0.3s ease;
`;

const StatusAlert = styled(Alert)`
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModeCard = styled(Card)`
  margin-bottom: 16px;
  border: 2px solid ${props => props.$active ? 
    props.theme.palette.primary.main : 
    'transparent'
  };
  background-color: ${props => props.$active ? 
    alpha(props.theme.palette.primary.main, props.theme.palette.mode === 'dark' ? 0.15 : 0.05) : 
    props.theme.palette.background.paper
  };
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.$active ? 
      props.theme.palette.primary.main : 
      alpha(props.theme.palette.primary.main, 0.5)
    };
    box-shadow: ${props => props.$active ? 
      props.theme.shadows[4] : 
      props.theme.shadows[1]
    };
  }
`;

const ThresholdContainer = styled(Paper)`
  padding: 16px;
  margin-bottom: 20px;
  background: ${props => props.theme.palette.mode === 'dark' ? 
    alpha(props.theme.palette.background.paper, 0.8) : 
    props.theme.palette.background.paper
  };
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 8px;
`;

const MoistureBar = styled(Box)`
  width: 100%;
  height: 24px;
  background-color: ${props => props.theme.palette.mode === 'dark' ? 
    alpha(props.theme.palette.background.paper, 0.2) : 
    alpha(props.theme.palette.grey[300], 0.6)
  };
  border-radius: 12px;
  overflow: hidden;
  margin: 16px 0;
  position: relative;
`;

const MoistureValue = styled(Box)`
  height: 100%;
  width: ${props => props.value}%;
  background: ${props => {
    const value = props.value;
    const min = props.min;
    const max = props.max;
    
    if (value < min) 
      return props.theme.palette.error.main;
    if (value > max) 
      return props.theme.palette.info.main;
    return props.theme.palette.success.main;
  }};
  transition: width 0.5s ease;
`;

const MoistureMarker = styled(Box)`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: ${props => props.isMax ? 
    props.theme.palette.info.main : 
    props.theme.palette.error.main
  };
  left: ${props => props.position}%;
  
  &::after {
    content: "${props => props.value}%";
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    background-color: ${props => props.isMax ? 
      props.theme.palette.info.main : 
      props.theme.palette.error.main
    };
    color: ${props => props.theme.palette.common.white};
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }
`;

const PumpButton = styled(IconButton)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.$active ? 
    `linear-gradient(45deg, ${props.theme.palette.error.dark}, ${props.theme.palette.error.main})` : 
    props.theme.palette.mode === 'dark' ? 
      alpha(props.theme.palette.grey[800], 0.8) :
      alpha(props.theme.palette.grey[300], 0.8)
  };
  color: ${props => props.$active ? 
    props.theme.palette.common.white : 
    props.theme.palette.text.primary
  };
  box-shadow: ${props => props.$active ? 
    `0 0 20px ${alpha(props.theme.palette.error.main, 0.5)}` : 
    'none'
  };
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
    background: ${props => props.$active ? 
      `linear-gradient(45deg, ${props.theme.palette.error.dark}, ${props.theme.palette.error.main})` : 
      alpha(props.theme.palette.primary.main, 0.1)
    };
  }
  
  &:disabled {
    opacity: 0.6;
  }
`;

const NotificationChip = styled(Chip)`
  animation: pulse 2s infinite;
  background-color: ${props => props.type === 'on' ? 
    alpha(props.theme.palette.success.main, 0.9) : 
    alpha(props.theme.palette.info.main, 0.9)
  };
  color: ${props => props.theme.palette.common.white};
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 ${props => props.type === 'on' ? 
      alpha(props.theme.palette.success.main, 0.7) : 
      alpha(props.theme.palette.info.main, 0.7)
    }; }
    70% { box-shadow: 0 0 0 10px ${props => 
      alpha(props.theme.palette.background.paper, 0)
    }; }
    100% { box-shadow: 0 0 0 0 ${props => 
      alpha(props.theme.palette.background.paper, 0)
    }; }
  }
`;

const PumpControl = ({ 
  isAutoThresholdActive = false,
  onEnableAutoThreshold,
  onDisableAutoThreshold,
  deviceInfo = {},
  currentSoilMoisture = 0,
  areas = [],
  deviceAreaMap = {},
  selectedDevice = ''
}) => {
  const theme = useTheme();
  
  const [pumpMode, setPumpMode] = useState(null);
  const [pumpActive, setPumpActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isInternalAutoMode, setIsInternalAutoMode] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(currentSoilMoisture);
  
  // Thêm state cho thông báo khi tự động bật/tắt máy bơm
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info' // 'on', 'off', 'info'
  });
  
  // Cập nhật độ ẩm từ prop
  useEffect(() => {
    setSoilMoisture(currentSoilMoisture);
  }, [currentSoilMoisture]);

  // Lấy ngưỡng độ ẩm
  const getPlantMoistureThresholds = () => {
    const defaultThresholds = { min: 30, max: 70 };
    
    if (!selectedDevice || !deviceAreaMap || !areas || areas.length === 0) {
      return defaultThresholds;
    }
    
    const mapping = deviceAreaMap[selectedDevice];
    if (!mapping) return defaultThresholds;
    
    const area = areas.find(a => a._id === mapping.areaId);
    if (!area) return defaultThresholds;
    
    if (mapping.plantIndex >= 0 && area.plants && area.plants[mapping.plantIndex]) {
      const plant = area.plants[mapping.plantIndex];
      const min = plant.moistureThreshold?.min || defaultThresholds.min;
      const max = plant.moistureThreshold?.max || defaultThresholds.max;
      return { min, max };
    }
    
    return defaultThresholds;
  };

  const minThreshold = getPlantMoistureThresholds().min;
  const maxThreshold = getPlantMoistureThresholds().max;

  // Effect để tự động điều khiển bơm 
  useEffect(() => {
    if ((isAutoThresholdActive || isInternalAutoMode) && pumpMode === '0') {
      const autoControl = async () => {
        try {
          if (soilMoisture < minThreshold && !pumpActive) {
            await sendCommand('pump-motor', 1, selectedDevice);
            setPumpActive(true);
            
            // Hiển thị thông báo khi bật máy bơm
            setNotification({
              show: true,
              message: `Độ ẩm đất (${soilMoisture}%) thấp hơn ngưỡng ${minThreshold}% - Đang tự động tưới nước`,
              type: 'on'
            });
            
          } else if (soilMoisture >= maxThreshold && pumpActive) {
            await sendCommand('pump-motor', 0, selectedDevice);
            setPumpActive(false);
            
            // Hiển thị thông báo khi tắt máy bơm
            setNotification({
              show: true,
              message: `Độ ẩm đất đã đạt ${soilMoisture}% (ngưỡng tối đa ${maxThreshold}%) - Đã tự động tắt máy bơm`,
              type: 'off'
            });
          }
        } catch (error) {
          console.error('Error in auto control:', error);
        }
      };
      
      autoControl();
      const interval = setInterval(autoControl, 30000);
      return () => clearInterval(interval);
    }
  }, [isAutoThresholdActive, isInternalAutoMode, pumpMode, soilMoisture, minThreshold, maxThreshold, pumpActive, selectedDevice]);

  // Fetch trạng thái máy bơm
  useEffect(() => {
    if (selectedDevice) {
      const fetchPumpState = async () => {
        try {
          const response = await getLatestSensorData(selectedDevice);
          
          if (response && response.data) {
            // Lấy mode (mặc định là thủ công)
            const modeValue = response.data['mode']?.value || '1';
            setPumpMode(modeValue);
            
            // Lấy trạng thái máy bơm
            if (response.data['pump-motor']) {
              setPumpActive(response.data['pump-motor'].value === '1');
            }
          } else {
            // Mặc định là chế độ thủ công khi không có dữ liệu
            setPumpMode('1');
            setPumpActive(false);
          }
        } catch (error) {
          console.error(`Error fetching pump state for device ${selectedDevice}:`, error);
          setPumpMode('1');
          setPumpActive(false);
        }
      };
      
      fetchPumpState();
      const interval = setInterval(fetchPumpState, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedDevice]);

  // Chuyển chế độ điều khiển - Đơn giản hóa để dễ chuyển đổi giữa các chế độ
  const handleModeClick = async (modeValue) => {
    try {
      setLoading(true);
      setError(false);
      setStatusMsg('Đang chuyển chế độ điều khiển...');
      
      // Nếu đang ở chế độ tự động và muốn chuyển sang thủ công
      if ((isAutoThresholdActive || isInternalAutoMode) && modeValue === 1) {
        // Nếu có hàm callback từ parent component
        if (typeof onDisableAutoThreshold === 'function') {
          onDisableAutoThreshold();
        }
        setIsInternalAutoMode(false);
      }
      
      await sendCommand('mode', modeValue, selectedDevice);
      setPumpMode(modeValue.toString());
      
      await sendCommand('pump-motor', 0, selectedDevice);
      setPumpActive(false);
      
      const successMsg = `Đã chuyển sang chế độ ${modeValue === 0 ? 'tự động' : 'thủ công'} thành công`;
      setStatusMsg(successMsg);
      
      setTimeout(() => {
        setStatusMsg(current => current === successMsg ? '' : current);
      }, 3000);
      
    } catch (error) {
      setError(true);
      setStatusMsg('Lỗi khi cập nhật chế độ điều khiển');
    } finally {
      setLoading(false);
    }
  };

  // Bật/tắt chế độ tự động theo ngưỡng độ ẩm
  const handleAutoThresholdClick = async () => {
    if (isAutoThresholdActive || isInternalAutoMode) {
      // Tắt chế độ tự động
      if (typeof onDisableAutoThreshold === 'function') {
        onDisableAutoThreshold();
      }
      
      try {
        setLoading(true);
        setError(false);
        setStatusMsg('Đang tắt chế độ tưới tự động...');
        
        await sendCommand('mode', 1, selectedDevice);
        await sendCommand('pump-motor', 0, selectedDevice);
        setPumpMode('1');
        setPumpActive(false);
        setIsInternalAutoMode(false);
        
        const successMsg = 'Đã tắt chế độ tưới tự động thành công';
        setStatusMsg(successMsg);
        
        setTimeout(() => {
          setStatusMsg(current => current === successMsg ? '' : current);
        }, 3000);
      } catch (error) {
        setError(true);
        setStatusMsg('Lỗi khi tắt chế độ tưới tự động');
      } finally {
        setLoading(false);
      }
    } else {
      // Bật chế độ tự động
      if (typeof onEnableAutoThreshold === 'function') {
        onEnableAutoThreshold();
      }
      
      try {
        setLoading(true);
        setError(false);
        setStatusMsg('Đang bật chế độ tưới tự động...');
        
        // Kiểm tra và điều chỉnh máy bơm dựa trên độ ẩm hiện tại
        if (soilMoisture < minThreshold) {
          console.log('Soil moisture is low, turning on pump...');
          await sendCommand('pump-motor', 1, selectedDevice);
          setPumpActive(true);
          
          // Thông báo bật máy bơm
          setNotification({
            show: true,
            message: `Độ ẩm đất (${soilMoisture}%) thấp hơn ngưỡng ${minThreshold}% - Đang tự động tưới nước`,
            type: 'on'
          });
        } else if (soilMoisture >= maxThreshold) {
          await sendCommand('pump-motor', 0, selectedDevice);
          setPumpActive(false);
        }
        
        setPumpMode('0');
        setIsInternalAutoMode(true);
        
        const successMsg = 'Đã bật chế độ tưới tự động thành công';
        setStatusMsg(successMsg);
        
        setTimeout(() => {
          setStatusMsg(current => current === successMsg ? '' : current);
        }, 3000);
      } catch (error) {
        setError(true);
        setStatusMsg('Lỗi khi bật chế độ tưới tự động');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Bật/tắt máy bơm trực tiếp
  const togglePump = async () => {
    try {
      setLoading(true);
      setError(false);
      setStatusMsg('Đang cập nhật trạng thái máy bơm...');
      
      const newState = pumpActive ? 0 : 1;
      await sendCommand('pump-motor', newState, selectedDevice);
      setPumpActive(newState === 1);
      
      const successMsg = `Đã ${newState === 1 ? 'bật' : 'tắt'} máy bơm thành công`;
      setStatusMsg(successMsg);
      
      setTimeout(() => {
        setStatusMsg(current => current === successMsg ? '' : current);
      }, 3000);
      
    } catch (error) {
      setError(true);
      setStatusMsg('Lỗi khi bật/tắt máy bơm');
    } finally {
      setLoading(false);
    }
  };
  
  // Đóng thông báo
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };
  
  // Hiển thị trạng thái loading
  if (pumpMode === null) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 4, 
        minHeight: 200 
      }}>
        <CircularProgress size={40} thickness={5} sx={{ mr: 2 }} />
        <Typography variant="h6">Đang tải dữ liệu điều khiển...</Typography>
      </Box>
    );
  }

  return (
    <ControlWrapper theme={theme}>
      {/* Thông báo trạng thái */}
      {statusMsg && (
        <Fade in={!!statusMsg}>
          <StatusAlert 
            severity={error ? 'error' : loading ? 'info' : 'success'}
            icon={error ? <ErrorIcon /> : loading ? <CircularProgress size={20} thickness={5} /> : <Check />}
          >
            {statusMsg}
          </StatusAlert>
        </Fade>
      )}
      
      {/* Thông báo tự động */}
      <Snackbar 
        open={notification.show} 
        autoHideDuration={10000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={notification.type === 'on' ? 'success' : 'info'}
          icon={notification.type === 'on' ? 
            <WaterDrop sx={{ animation: 'pulse 1s infinite' }} /> : 
            <Info />
          }
          onClose={handleCloseNotification}
          sx={{ 
            width: '100%', 
            boxShadow: theme.shadows[4]
          }}
          action={
            <NotificationChip
              theme={theme}
              type={notification.type}
              icon={notification.type === 'on' ? <ToggleOn /> : <ToggleOff />}
              label={notification.type === 'on' ? 'Đang tưới' : 'Đã tắt'}
              size="small"
            />
          }
        >
          <Typography variant="body2">{notification.message}</Typography>
        </Alert>
      </Snackbar>
      
      {/* Hiển thị thông tin độ ẩm đất và ngưỡng */}
      <ThresholdContainer theme={theme} elevation={theme.palette.mode === 'dark' ? 2 : 1}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={1}>
              <WaterDrop color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Độ ẩm đất hiện tại
              </Typography>
              <Chip 
                size="small" 
                label={
                  soilMoisture < minThreshold ? "Quá khô" : 
                  soilMoisture > maxThreshold ? "Quá ẩm" : 
                  "Lý tưởng"
                }
                color={
                  soilMoisture < minThreshold ? "error" : 
                  soilMoisture > maxThreshold ? "info" : 
                  "success"
                }
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {soilMoisture}%
              </Typography>
              <Tooltip title={`Ngưỡng tưới: ${minThreshold}% - ${maxThreshold}%`}>
                <Info fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
              </Tooltip>
            </Box>
            
            <MoistureBar theme={theme}>
              <MoistureValue 
                theme={theme}
                value={soilMoisture} 
                min={minThreshold} 
                max={maxThreshold}
              />
              <MoistureMarker theme={theme} position={minThreshold} value={minThreshold} />
              <MoistureMarker theme={theme} position={maxThreshold} value={maxThreshold} isMax />
            </MoistureBar>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box p={2} bgcolor={alpha(theme.palette.background.default, 0.5)} borderRadius={1} border={`1px solid ${theme.palette.divider}`}>
              {deviceInfo.plantName ? (
                <>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Grass color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="medium">
                      {deviceInfo.plantName}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <Settings fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Ngưỡng tưới: {minThreshold}% - {maxThreshold}%
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <EnergySavingsLeaf fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="body2" color="text.secondary">
                      {(isAutoThresholdActive || isInternalAutoMode) ? 'Tưới tự động đã thiết lập' : 'Tưới thủ công'}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="text.secondary" textAlign="center">
                    Chưa có thông tin cây trồng
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </ThresholdContainer>
      
      <Typography variant="h6" fontWeight="medium" gutterBottom>
        Chọn chế độ điều khiển máy bơm
      </Typography>

      <Grid container spacing={2}>
        {/* Chế độ tưới tự động */}
        <Grid item xs={12} md={6}>
          <ModeCard 
            theme={theme} 
            $active={isAutoThresholdActive || isInternalAutoMode}
            elevation={theme.palette.mode === 'dark' ? 3 : 1}
            sx={{
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              height: '100%'
            }}
            onClick={() => !loading && handleAutoThresholdClick()}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center">
                  <SmartToy 
                    color={isAutoThresholdActive || isInternalAutoMode ? "primary" : "action"} 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="h6" color={isAutoThresholdActive || isInternalAutoMode ? "primary" : "textPrimary"}>
                    Tưới tự động
                  </Typography>
                </Box>
              
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Máy bơm tự động bật khi độ ẩm thấp hơn {minThreshold}% và tắt khi đạt {maxThreshold}%.
              </Typography>
              
              <Box mt={2} display="flex" alignItems="center">
                <AccessTime fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Tự động kiểm tra mỗi 30 giây
                </Typography>
              </Box>
              
              {(isAutoThresholdActive || isInternalAutoMode) && (
                <Fade in={true}>
                  <Box 
                    mt={2} 
                    p={1} 
                    bgcolor={alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}
                    borderRadius={1}
                    display="flex"
                    alignItems="center"
                  >
                    <Check sx={{ color: theme.palette.success.main, mr: 1 }} />
                    <Typography variant="body2" color="success.main">
                      Đang hoạt động
                    </Typography>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </ModeCard>
        </Grid>
        
        {/* Chế độ điều khiển thủ công */}
        <Grid item xs={12} md={6}>
          <ModeCard 
            theme={theme} 
            $active={!isAutoThresholdActive && !isInternalAutoMode && pumpMode === '1'}
            elevation={theme.palette.mode === 'dark' ? 3 : 1}
            sx={{
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              height: '100%'
            }}
            onClick={() => !loading && handleModeClick(1)}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center">
                  <PowerSettingsNew 
                    color={!isAutoThresholdActive && !isInternalAutoMode && pumpMode === '1' ? "primary" : "action"} 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="h6" color={!isAutoThresholdActive && !isInternalAutoMode && pumpMode === '1' ? "primary" : "textPrimary"}>
                    Điều khiển thủ công
                  </Typography>
                </Box>
                
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Điều khiển trực tiếp máy bơm bằng nút bật/tắt bên dưới.
              </Typography>
              
              {!isAutoThresholdActive && !isInternalAutoMode && pumpMode === '1' ? (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  mt={3}
                  onClick={(e) => e.stopPropagation()} // Ngăn sự kiện lan tới ModeCard
                >
                  <PumpButton
                    theme={theme}
                    $active={pumpActive}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      togglePump(); 
                    }}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? (
                      <CircularProgress size={30} color="inherit" thickness={5} />
                    ) : (
                      <Fade in={true}>
                        {pumpActive ? <ToggleOn sx={{ fontSize: "3rem" }} /> : <ToggleOff sx={{ fontSize: "3rem" }} />}
                      </Fade>
                    )}
                  </PumpButton>
                  
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="medium" 
                    color={pumpActive ? "error" : "text.secondary"}
                    mt={2}
                  >
                    {pumpActive ? 'Máy bơm đang hoạt động' : 'Máy bơm đã tắt'}
                  </Typography>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" mt={3} mb={1}>
                  <Chip 
                    icon={<Info fontSize="small" />}
                    label="Nhấn để kích hoạt chế độ thủ công"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
          </ModeCard>
        </Grid>
      </Grid>
    </ControlWrapper>
  );
};

export default PumpControl;