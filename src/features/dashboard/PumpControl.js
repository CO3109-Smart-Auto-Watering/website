import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPowerOff } from 'react-icons/fa';

// Hai nút chế độ bơm
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

// Nút bật/tắt bơm khi ở chế độ thủ công
const PumpButton = styled.button`
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

// Vùng bọc để hiển thị hai nút chế độ
const ModeContainer = styled.div`
  display: flex;
  margin-top: 16px;
`;

const PumpStatus = styled.div`
  margin-top: 10px;
  color: ${props => props.$active ? '#4975d1' : '#666'};
`;

const PumpControl = () => {
  const [pumpMode, setPumpMode] = useState(null);   // '1': auto, '0': manual
  const [pumpActive, setPumpActive] = useState(false); // true: bật, false: tắt (chỉ dùng khi manual)

  // Lấy dữ liệu ban đầu từ Adafruit
  useEffect(() => {
    const fetchPumpMode = async () => {
      try {
        const response = await fetch(
          `https://io.adafruit.com/api/v2/${process.env.REACT_APP_AIO_USERNAME}/feeds/mode/data?limit=1`,
          {
            headers: {
              'X-AIO-Key': process.env.REACT_APP_AIO_KEY,
              'Content-Type': 'application/json',
            },
          }
        );
        const jsonData = await response.json();
        if (jsonData.length > 0) {
          const modeValue = jsonData[0].value.toString();
          setPumpMode(modeValue);
  
          // Nếu mode = '0' (manual) thì lấy thêm trạng thái bơm
          if (modeValue === '0') {
            fetchPumpStatus();
          }
        }
      } catch (error) {
        console.error('Error fetching pump-mode:', error);
      }
    };

    const fetchPumpStatus = async () => {
      try {
        const response = await fetch(
          `https://io.adafruit.com/api/v2/${process.env.REACT_APP_AIO_USERNAME}/feeds/pump-motor/data?limit=1`,
          {
            headers: {
              'X-AIO-Key': process.env.REACT_APP_AIO_KEY,
              'Content-Type': 'application/json',
            },
          }
        );
        const jsonData = await response.json();
        if (jsonData.length > 0) {
          // pump-motor = '1' => đang bật, '0' => tắt
          setPumpActive(jsonData[0].value.toString() === '1');
        }
      } catch (error) {
        console.error('Error fetching pump-motor:', error);
      }
    };

    fetchPumpMode();
  }, []);

  // Hàm gọi API Adafruit để cập nhật mode (0 hoặc 1)
  const updatePumpMode = async (newMode) => {
    try {
      await fetch(
        `https://io.adafruit.com/api/v2/${process.env.REACT_APP_AIO_USERNAME}/feeds/mode/data`,
        {
          method: 'POST',
          headers: {
            'X-AIO-Key': process.env.REACT_APP_AIO_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: newMode.toString() }),
        }
      );
      setPumpMode(newMode.toString());
  
      // Nếu chuyển sang thủ công (0) thì tắt bơm mặc định
      if (newMode === 0) {
        await updatePumpMotor(0);
      }
    } catch (error) {
      console.error('Error updating pump-mode:', error);
    }
  };

  // Hàm gọi API Adafruit để cập nhật trạng thái bơm (0 hoặc 1)
  const updatePumpMotor = async (newState) => {
    try {
      await fetch(
        `https://io.adafruit.com/api/v2/${process.env.REACT_APP_AIO_USERNAME}/feeds/pump-motor/data`,
        {
          method: 'POST',
          headers: {
            'X-AIO-Key': process.env.REACT_APP_AIO_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: newState.toString() }),
        }
      );
      setPumpActive(newState === 1);
    } catch (error) {
      console.error('Error updating pump-motor:', error);
    }
  };

  // Xử lý người dùng bấm nút Tự động hoặc Thủ công
  const handleModeClick = (modeValue) => {
    if (pumpMode !== modeValue.toString()) {
      updatePumpMode(modeValue);
    }
  };

  // Xử lý bật/tắt bơm khi đang ở chế độ thủ công
  const togglePump = () => {
    if (pumpMode === '0') {
      updatePumpMotor(pumpActive ? 0 : 1);
    }
  };

  return (
    <div>

      <ModeContainer>
        {/* Nút Tự động */}
        <ModeButton
          $active={pumpMode === '1'}
          onClick={() => handleModeClick(1)}
        >
          Tự động
        </ModeButton>

        {/* Nút Thủ công */}
        <ModeButton
          $active={pumpMode === '0'}
          onClick={() => handleModeClick(0)}
        >
          Thủ công
        </ModeButton>
      </ModeContainer>

      {/* Nếu chế độ thủ công thì hiện nút bật/tắt bơm */}
      {pumpMode === '0' && (
        <div style={{ textAlign: 'center' }}>
          <PumpButton $active={pumpActive} onClick={togglePump}>
            {pumpActive ? 'Tắt' : 'Bật'}
          </PumpButton>
          <PumpStatus $active={pumpActive}>
            {pumpActive ? 'Máy bơm đang hoạt động' : 'Máy bơm đã tắt'}
          </PumpStatus>
        </div>
      )}
    </div>
  );
};

export default PumpControl;
