import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPowerOff, FaRobot, FaCheck, FaSpinner, FaExclamationTriangle, 
         FaWater, FaLeaf, FaSlidersH, FaTint, FaClock } from 'react-icons/fa';
import { getLatestSensorData, sendCommand, getAdafruitFeedData } from '../../services/sensorService';
import { Box, Typography, Button, Divider, Chip } from '@mui/material';

// Styled components
const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: ${props => 
    props.error ? '#FEE2E2' : 
    props.loading ? '#F3F4F6' : 
    '#ECFDF5'};
  color: ${props => 
    props.error ? '#B91C1C' : 
    props.loading ? '#4B5563' : 
    '#047857'};
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  
  svg {
    margin-right: 8px;
  }
`;

const ModeContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const ModeButton = styled.button`
  flex: 1;
  background-color: ${props => props.$active ? '#3f51b5' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: none;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${props => props.$active ? '#3f51b5' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AutoModeMessage = styled.div`
  display: flex;
  align-items: center;
  background-color: #E0F2FE;
  color: #0369A1;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
  
  svg {
    margin-right: 8px;
  }
`;

const PumpControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const PumpButton = styled.button`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.$active ? '#ef4444' : '#e0e0e0'};
  color: ${props => props.$active ? 'white' : '#333'};
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    filter: ${props => props.$active ? 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))' : 'none'};
  }
`;

const PumpStatus = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.$active ? '#ef4444' : '#666'};
`;

// Styled components mới
const ControlPanel = styled.div`
  padding: 16px;
`;

const ModeSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

const ModeCard = styled.div`
  padding: 16px;
  border-radius: 8px;
  border: 2px solid ${props => props.$active ? '#3f51b5' : '#e0e0e0'};
  background-color: ${props => props.$active ? 'rgba(63, 81, 181, 0.05)' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3f51b5;
    background-color: ${props => props.$active ? 'rgba(63, 81, 181, 0.05)' : 'rgba(63, 81, 181, 0.02)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.$active ? '#3f51b5' : '#333'};
`;

const ModeDescription = styled.div`
  font-size: 14px;
  color: #666;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  svg {
    color: #3f51b5;
    margin-right: 8px;
    min-width: 16px;
  }
`;

const MoistureBar = styled.div`
  width: 100%;
  height: 24px;
  background-color: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  margin: 8px 0 16px 0;
  position: relative;
`;

const MoistureValue = styled.div`
  height: 100%;
  width: ${props => props.value}%;
  background-color: ${props => {
    if (props.value < props.min) return '#ef4444';
    if (props.value > props.max) return '#3b82f6';
    return '#10b981';
  }};
  transition: width 0.5s ease;
`;

const MoistureMarker = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: ${props => props.isMax ? '#3b82f6' : '#ef4444'};
  left: ${props => props.position}%;
  
  &:after {
    content: '${props => props.value}%';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    white-space: nowrap;
  }
`;

const ThresholdCard = styled.div`
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
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
  const [pumpMode, setPumpMode] = useState(null);   // '1': manual, '0': auto
  const [pumpActive, setPumpActive] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isInternalAutoMode, setIsInternalAutoMode] = useState(false);
  
  // State để theo dõi độ ẩm hiện tại
  const [soilMoisture, setSoilMoisture] = useState(currentSoilMoisture);
  
  // Cập nhật độ ẩm từ prop
  useEffect(() => {
    setSoilMoisture(currentSoilMoisture);
  }, [currentSoilMoisture]);

  // Cập nhật độ ẩm từ Adafruit nếu không có prop
  useEffect(() => {
    if (currentSoilMoisture === 0) {
      const fetchSoilMoisture = async () => {
        try {
          const soilData = await getAdafruitFeedData('sensor-soil');
          if (soilData !== null) {
            setSoilMoisture(parseInt(soilData, 10));
          }
        } catch (error) {
          console.error('Error fetching soil moisture:', error);
        }
      };
      
      fetchSoilMoisture();
      const interval = setInterval(fetchSoilMoisture, 10000);
      return () => clearInterval(interval);
    }
  }, [currentSoilMoisture]);

  useEffect(() => {
    if (selectedDevice) {
      console.log(`Cập nhật trạng thái bơm cho thiết bị: ${selectedDevice}`);
      
      // Fetch trạng thái mới của thiết bị khi chuyển đổi
      const fetchDeviceState = async () => {
        try {
          setLoading(true);
          const response = await getLatestSensorData(selectedDevice);
          console.log(`Dữ liệu điều khiển bơm cho device ${selectedDevice}:`, response);
          
          if (response && response.data) {
            // Cập nhật trạng thái bơm và chế độ
            const modeValue = response.data['mode']?.value || '1';
            setPumpMode(modeValue);
            
            if (response.data['pump-motor']) {
              setPumpActive(response.data['pump-motor'].value === '1');
            }
          }
        } catch (error) {
          console.error(`Error fetching device state for ${selectedDevice}:`, error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchDeviceState();
      
      // Cập nhật độ ẩm đất cho thiết bị
      const fetchSoilMoisture = async () => {
        try {
          const soilData = await getAdafruitFeedData('sensor-soil', selectedDevice);
          if (soilData !== null) {
            setSoilMoisture(parseInt(soilData, 10));
          }
        } catch (error) {
          console.error(`Error fetching soil moisture for device ${selectedDevice}:`, error);
        }
      };
      
      fetchSoilMoisture();
    }
  }, [selectedDevice]);

  // Fetch initial state from backend
  useEffect(() => {
    const fetchPumpState = async () => {
      try {
        const response = await getLatestSensorData(selectedDevice);
        console.log(`Pump control data for device ${selectedDevice}:`, response);
        
        // If response is successful and data exists
        if (response && response.data) {
          // Set mode (default to manual if null)
          const modeValue = response.data['mode']?.value || '1'; // Default to manual (1)
          setPumpMode(modeValue);
          
          // Set pump state (default to off if null)
          if (response.data['pump-motor']) { 
            setPumpActive(response.data['pump-motor'].value === '1');
          }
        } else {
          // If no data, default to manual mode with pump off
          setPumpMode('1'); // Default to manual (1)
          setPumpActive(false);
        }
      } catch (error) {
        console.error(`Error fetching pump state for device ${selectedDevice}:`, error);
        setError(true);
        
        // Default to manual mode when error occurs
        setPumpMode('1'); // Default to manual (1)
        setPumpActive(false);
      }
    };
    
    if (selectedDevice) {
      fetchPumpState();
      
      // Set up polling to refresh pump state
      const interval = setInterval(fetchPumpState, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedDevice]);
  

  // Hàm lấy thông tin ngưỡng độ ẩm trực tiếp từ dữ liệu cây trồng
  const getPlantMoistureThresholds = () => {
    // Giá trị mặc định
    const defaultThresholds = { min: 30, max: 70 };
    
    // Kiểm tra điều kiện cần thiết
    if (!selectedDevice || !deviceAreaMap || !areas || areas.length === 0) {
      console.log('Không đủ thông tin để xác định ngưỡng độ ẩm, sử dụng giá trị mặc định');
      return defaultThresholds;
    }
    
    // Lấy mapping cho thiết bị được chọn
    const mapping = deviceAreaMap[selectedDevice];
    if (!mapping) {
      console.log(`Không tìm thấy mapping cho thiết bị ${selectedDevice}`);
      return defaultThresholds;
    }
    
    // Tìm khu vực tương ứng
    const area = areas.find(a => a._id === mapping.areaId);
    if (!area) {
      console.log(`Không tìm thấy khu vực có ID ${mapping.areaId}`);
      return defaultThresholds;
    }
    
    // Kiểm tra dữ liệu cây trồng
    if (mapping.plantIndex >= 0 && area.plants && area.plants[mapping.plantIndex]) {
      const plant = area.plants[mapping.plantIndex];
      const min = plant.moistureThreshold?.min || defaultThresholds.min;
      const max = plant.moistureThreshold?.max || defaultThresholds.max;
      
      return { min, max };
    }
    
    console.log('Không tìm thấy thông tin cây trồng, sử dụng giá trị mặc định');
    return defaultThresholds;
  };

  // Lấy ngưỡng độ ẩm từ deviceInfo và áp dụng giá trị mặc định mới
  const minThreshold = getPlantMoistureThresholds().min || deviceInfo.moistureMinThreshold || 30;
  
  const maxThreshold = getPlantMoistureThresholds().max || deviceInfo.moistureMaxThreshold || 70;

  // Effect để tự động điều khiển bơm khi ở chế độ tự động
  useEffect(() => {
    if ((isAutoThresholdActive || isInternalAutoMode) && pumpMode === '0') {
      const autoControl = async () => {
        try {
          if (soilMoisture < minThreshold && !pumpActive) {
            await sendCommand('pump-motor', 1);
            setPumpActive(true);
            console.log('Auto turned on pump - soil moisture below threshold');
          } else if (soilMoisture >= maxThreshold && pumpActive) {
            await sendCommand('pump-motor', 0);
            setPumpActive(false);
            console.log('Auto turned off pump - soil moisture above threshold');
          }
        } catch (error) {
          console.error('Error in auto control:', error);
        }
      };
      
      autoControl();
      const interval = setInterval(autoControl, 30000);
      return () => clearInterval(interval);
    }
  }, [isAutoThresholdActive, isInternalAutoMode, pumpMode, soilMoisture, minThreshold, maxThreshold, pumpActive]);

  // Handle mode change (auto/manual)
  const handleModeClick = async (modeValue) => {
    // Không cho phép thay đổi chế độ nếu đang ở chế độ tự động ngưỡng
    if (isAutoThresholdActive && modeValue === 1) {
      setError(true);
      setStatusMsg('Vui lòng tắt chế độ tự động ngưỡng trước khi chuyển sang điều khiển thủ công');
      return;
    }
    
    try {
      setLoading(true);
      setError(false);
      setStatusMsg('Đang chuyển chế độ điều khiển...');
      
      await sendCommand('mode', modeValue, selectedDevice);
      setPumpMode(modeValue.toString());
      
      // If switching to manual mode, ensure pump is off by default
      if (modeValue === 1) {
        await sendCommand('pump-motor', 0, selectedDevice);
        setPumpActive(false);
        setIsInternalAutoMode(false);
      }
      
      // Store the success message in a variable
      const successMsg = `Đã chuyển sang chế độ ${modeValue === 0 ? 'tự động' : 'thủ công'} thành công`;
      setStatusMsg(successMsg);
      
      // Auto-clear this specific success message after 3 seconds
      setTimeout(() => {
        setStatusMsg(current => current === successMsg ? '' : current);
      }, 3000);
      
    } catch (error) {
      console.error(`Error updating pump mode for device ${selectedDevice}:`, error);
      setError(true);
      setStatusMsg('Lỗi khi cập nhật chế độ điều khiển');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoThresholdClick = async () => {
    if (isAutoThresholdActive || isInternalAutoMode) {
      // Nếu đang bật, tắt chế độ tự động ngưỡng
      if (typeof onDisableAutoThreshold === 'function') {
        onDisableAutoThreshold();
      } else {
        try {
          setLoading(true);
          setError(false);
          setStatusMsg('Đang tắt chế độ tưới tự động...');
          
          // Chuyển sang chế độ thủ công và tắt bơm
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
          console.error(`Error disabling auto threshold mode for device ${selectedDevice}:`, error);
          setError(true);
          setStatusMsg('Lỗi khi tắt chế độ tưới tự động');
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Nếu đang tắt, bật chế độ tự động ngưỡng
      if (typeof onEnableAutoThreshold === 'function') {
        onEnableAutoThreshold();
      } else {
        try {
          setLoading(true);
          setError(false);
          setStatusMsg('Đang bật chế độ tưới tự động...');
          
          // Áp dụng ngưỡng độ ẩm từ thông tin cây trồng
          // Chuyển sang chế độ tự động
          await sendCommand('mode', 0);
          
          // Kiểm tra độ ẩm hiện tại và điều khiển bơm
          if (soilMoisture < minThreshold) {
            await sendCommand('pump-motor', 1);
            setPumpActive(true);
          } else if (soilMoisture >= maxThreshold) {
            await sendCommand('pump-motor', 0);
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
          console.error('Error enabling auto threshold mode:', error);
          setError(true);
          setStatusMsg('Lỗi khi bật chế độ tưới tự động');
        } finally {
          setLoading(false);
        }
      }
    }
  };
  
  // Toggle pump function
  const togglePump = async () => {
    if (pumpMode !== '1') return;
    
    try {
      setLoading(true);
      setError(false);
      setStatusMsg('Đang cập nhật trạng thái máy bơm...');
      
      const newState = pumpActive ? 0 : 1;
      await sendCommand('pump-motor', newState, selectedDevice);
      setPumpActive(newState === 1);
      
      // Store the success message in a variable
      const successMsg = `Đã ${newState === 1 ? 'bật' : 'tắt'} máy bơm thành công`;
      setStatusMsg(successMsg);
      
      // Auto-clear this specific success message after 3 seconds
      setTimeout(() => {
        setStatusMsg(current => current === successMsg ? '' : current);
      }, 3000);
      
    } catch (error) {
      console.error(`Error toggling pump for device ${selectedDevice}:`, error);
      setError(true);
      setStatusMsg('Lỗi khi bật/tắt máy bơm');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if mode is not fetched yet
  if (pumpMode === null) {
    return (
      <ControlPanel>
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} />
          <Typography>Đang tải trạng thái điều khiển...</Typography>
        </Box>
      </ControlPanel>
    );
  }

  return (
    <ControlPanel>
      {/* Status message with icons */}
      {statusMsg && (
        <StatusMessage error={error} loading={loading}>
          {error ? <FaExclamationTriangle /> : 
           loading ? <FaSpinner className="fa-spin" /> : 
           <FaCheck />}
          {statusMsg}
        </StatusMessage>
      )}
      
      {/* Moisture bar with threshold markers */}
      <ThresholdCard>
        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <FaWater style={{ marginRight: '8px', color: '#3f51b5' }} /> 
          Độ ẩm đất hiện tại: <strong style={{ marginLeft: '8px' }}>{soilMoisture}%</strong>
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
            sx={{ ml: 'auto' }}
          />
        </Typography>
        
        <MoistureBar>
          <MoistureValue 
            value={soilMoisture} 
            min={minThreshold} 
            max={maxThreshold}
          />
          <MoistureMarker position={minThreshold} value={minThreshold} />
          <MoistureMarker position={maxThreshold} value={maxThreshold} isMax />
        </MoistureBar>
        
        {/* Plant info if available */}
        {deviceInfo.plantName && (
          <>
            <InfoItem>
              <FaLeaf />
              <Typography variant="body2">
                <strong>Cây trồng:</strong> {deviceInfo.plantName}
              </Typography>
            </InfoItem>
            <InfoItem>
              <FaSlidersH />
              <Typography variant="body2">
                <strong>Ngưỡng độ ẩm khuyến nghị:</strong> {minThreshold}% - {maxThreshold}%
              </Typography>
            </InfoItem>
          </>
        )}
      </ThresholdCard>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Chọn chế độ điều khiển
      </Typography>
      
      <ModeSelector>
        {/* Auto threshold mode */}
        <ModeCard 
          $active={isAutoThresholdActive || isInternalAutoMode}
          onClick={handleAutoThresholdClick}
          disabled={loading}
        >
          <ModeTitle $active={isAutoThresholdActive || isInternalAutoMode}>
            <FaRobot /> Tưới tự động theo ngưỡng độ ẩm
          </ModeTitle>
          <ModeDescription>
            Máy bơm sẽ tự động bật khi độ ẩm dưới {minThreshold}% và tắt khi độ ẩm đạt {maxThreshold}%.
          </ModeDescription>
          {(isAutoThresholdActive || isInternalAutoMode) && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                p: 1, 
                bgcolor: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: 1,
                color: 'rgb(16, 185, 129)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaCheck style={{ marginRight: '4px' }} /> Đang hoạt động
            </Typography>
          )}
        </ModeCard>
        
        {/* Manual mode */}
        <ModeCard 
          $active={!isAutoThresholdActive && !isInternalAutoMode && pumpMode === '1'}
          onClick={() => !isAutoThresholdActive && !isInternalAutoMode && handleModeClick(1)}
          disabled={loading || isAutoThresholdActive || isInternalAutoMode}
        >
          <ModeTitle $active={!isAutoThresholdActive && !isInternalAutoMode && pumpMode === '1'}>
            <FaPowerOff /> Điều khiển thủ công
          </ModeTitle>
          <ModeDescription>
            Điều khiển trực tiếp máy bơm bằng nút bật/tắt.
          </ModeDescription>
          {!isAutoThresholdActive && !isInternalAutoMode && pumpMode === '1' && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                p: 1, 
                bgcolor: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: 1,
                color: 'rgb(239, 68, 68)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaCheck style={{ marginRight: '4px' }} /> Đang hoạt động
            </Typography>
          )}
        </ModeCard>
      </ModeSelector>
      
      {/* Manual control pump button */}
      {!isAutoThresholdActive && !isInternalAutoMode && pumpMode === '1' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
          <PumpButton 
            $active={pumpActive} 
            onClick={togglePump}
            disabled={loading}
          >
            <FaPowerOff />
          </PumpButton>
          <PumpStatus $active={pumpActive}>
            {pumpActive ? 'Máy bơm đang hoạt động' : 'Máy bơm đã tắt'}
          </PumpStatus>
        </Box>
      )}
    </ControlPanel>
  );
};

// Add some CSS for the spinner animation
const style = document.createElement('style');
style.textContent = `
  .fa-spin {
    animation: fa-spin 2s infinite linear;
  }
  @keyframes fa-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(style);

export default PumpControl;