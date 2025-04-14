import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPowerOff, FaRobot, FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { getLatestSensorData, sendCommand } from '../../services/sensorService';

// Keep your existing styled components

const PumpControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 16px;
`;


const ModeButton = styled.button`
  flex: 1;
  padding: 14px;
  border: 2px solid ${props => props.$active ? '#4975d1' : '#e0e0e0'};
  background: ${props => props.$active ? 'rgba(73, 117, 209, 0.1)' : 'white'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: ${props => props.$active ? '#4975d1' : '#666'};
  transition: all 0.2s;
  margin-right: 8px;

  &:hover {
    border-color: #4975d1;
    color: #4975d1;
  }

  &:last-child {
    margin-right: 0;
  }
`;

const PumpButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$active ? '#4975d1' : '#f5f5f5'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  cursor: pointer;
  font-size: 22px;
  margin: 0 auto;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${props => props.$active ? '#3a66c2' : '#e0e0e0'};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ModeContainer = styled.div`
  display: flex;
  margin-top: 16px;
`;

const PumpStatus = styled.div`
  margin-top: 10px;
  color: ${props => props.$active ? '#4975d1' : '#666'};
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.error 
    ? 'rgba(231, 76, 60, 0.1)' 
    : props.loading 
      ? 'rgba(243, 156, 18, 0.1)' 
      : 'rgba(39, 174, 96, 0.1)'
  };
  border: 1px solid ${props => props.error 
    ? 'rgba(231, 76, 60, 0.2)' 
    : props.loading 
      ? 'rgba(243, 156, 18, 0.2)' 
      : 'rgba(39, 174, 96, 0.2)'
  };
  color: ${props => props.error 
    ? '#e74c3c' 
    : props.loading 
      ? '#f39c12' 
      : '#27ae60'
  };
  
  svg {
    margin-right: 8px;
  }
`;

const AutoModeMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 12px;
  background: rgba(73, 117, 209, 0.1);
  border: 1px solid rgba(73, 117, 209, 0.2);
  border-radius: 8px;
  color: #4975d1;
  
  svg {
    margin-right: 8px;
  }
`;



const PumpControl = () => {
  const [pumpMode, setPumpMode] = useState(null);   // '1': manual, '0': auto (SWAPPED)
  const [pumpActive, setPumpActive] = useState(false); // true: bật, false: tắt (chỉ dùng khi manual)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Fetch initial state from backend
  useEffect(() => {
    const fetchPumpState = async () => {
      try {
        const response = await getLatestSensorData();
        console.log("Pump control data:", response);
        
        // If response is successful and data exists
        if (response && response.data) {
          // Set mode (default to manual if null)
          const modeValue = response.data['mode']?.value || '1'; // Default to manual (1)
          setPumpMode(modeValue);
          
          // Set pump state (default to off if null)
          if (modeValue === '1' && response.data['pump-motor']) { // Changed to 1 for manual
            setPumpActive(response.data['pump-motor'].value === '1');
          }
        } else {
          // If no data, default to manual mode with pump off
          setPumpMode('1'); // Default to manual (1)
          setPumpActive(false);
        }
      } catch (error) {
        console.error('Error fetching pump state:', error);
        setError(true);
        
        // Default to manual mode when error occurs
        setPumpMode('1'); // Default to manual (1)
        setPumpActive(false);
      }
    };
    
    fetchPumpState();
  }, []);

  // Handle mode change (auto/manual)
  const handleModeClick = async (modeValue) => {
    try {
      setLoading(true);
      setError(false);
      setStatusMsg('Đang chuyển chế độ điều khiển...');
      
      await sendCommand('mode', modeValue);
      setPumpMode(modeValue.toString());
      
      // If switching to manual mode, ensure pump is off by default
      if (modeValue === 1) {
        await sendCommand('pump-motor', 0);
        setPumpActive(false);
      }
      
      // Store the success message in a variable
      const successMsg = `Đã chuyển sang chế độ ${modeValue === 0 ? 'tự động' : 'thủ công'} thành công`;
      setStatusMsg(successMsg);
      
      // Auto-clear this specific success message after 3 seconds
      setTimeout(() => {
        setStatusMsg(current => current === successMsg ? '' : current);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating pump mode:', error);
      setError(true);
      setStatusMsg('Lỗi khi cập nhật chế độ điều khiển');
    } finally {
      setLoading(false);
    }
  };
  
  // Fix the togglePump function
  const togglePump = async () => {
    if (pumpMode !== '1') return;
    
    try {
      setLoading(true);
      setError(false);
      setStatusMsg('Đang cập nhật trạng thái máy bơm...');
      
      const newState = pumpActive ? 0 : 1;
      await sendCommand('pump-motor', newState);
      setPumpActive(newState === 1);
      
      // Store the success message in a variable
      const successMsg = `Đã ${newState === 1 ? 'bật' : 'tắt'} máy bơm thành công`;
      setStatusMsg(successMsg);
      
      // Auto-clear this specific success message after 3 seconds
      setTimeout(() => {
        setStatusMsg(current => current === successMsg ? '' : current);
      }, 3000);
      
    } catch (error) {
      console.error('Error toggling pump:', error);
      setError(true);
      setStatusMsg('Lỗi khi bật/tắt máy bơm');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if mode is not fetched yet
  if (pumpMode === null) {
    return <div>Đang tải trạng thái điều khiển...</div>;
  }

  return (
    <div>
      <ModeContainer>
        <ModeButton
          $active={pumpMode === '0'}
          onClick={() => handleModeClick(0)}
          disabled={loading}
        >
          Tự động
        </ModeButton>

        <ModeButton
          $active={pumpMode === '1'}
          onClick={() => handleModeClick(1)}
          disabled={loading}
        >
          Thủ công
        </ModeButton>
      </ModeContainer>

      {/* Status message with icons */}
      {statusMsg && (
        <StatusMessage error={error} loading={loading}>
          {error ? <FaExclamationTriangle /> : 
           loading ? <FaSpinner className="fa-spin" /> : 
           <FaCheck />}
          {statusMsg}
        </StatusMessage>
      )}

      {/* Automatic mode message */}
      {pumpMode === '0' && (
        <AutoModeMessage>
          <FaRobot />
          Máy bơm đang ở chế độ tự động
        </AutoModeMessage>
      )}

      {/* Manual mode control */}
      {pumpMode === '1' && (
        <PumpControlContainer>
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
        </PumpControlContainer>
      )}
    </div>
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