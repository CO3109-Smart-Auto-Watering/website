import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';

const ForecastContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding: 8px 0;
  margin-top: 16px;
  
  /* Tạo scrollbar nhẹ nhàng hơn cho cả hai chế độ */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(0,0,0,0.05)'
    };
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.2)' 
      : 'rgba(0,0,0,0.1)'
    };
    border-radius: 4px;
  }
`;

const ForecastItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  background: ${props => props.theme.palette.mode === 'dark' 
    ? props.theme.palette.background.default
    : '#f5f5f5'
  };
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.palette.divider};
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

const DayLabel = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 16px;
  color: ${props => props.theme.palette.text.primary};
`;

const TempInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.palette.text.primary};
`;

const RainInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.palette.text.secondary};
`;

const IconDisplay = styled.div`
  font-size: 36px;
  margin-bottom: 8px;
`;

const WeatherForecastSummary = () => {
  const theme = useTheme();
  const [dailyForecasts, setDailyForecasts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sử dụng thành phố Ho Chi Minh
  const city = 'Ho Chi Minh';
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'your-api-key-fallback';

  // Mapping từ mã icon của OpenWeatherMap sang emoji
  const emojiMapping = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '⛅',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌦️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
          throw new Error('Không thể lấy dữ liệu dự báo thời tiết');
        }
        
        const data = await response.json();
        
        // Nhóm dữ liệu theo ngày (định dạng yyyy-mm-dd)
        const grouped = data.list.reduce((acc, item) => {
          const dateKey = new Date(item.dt * 1000).toISOString().split('T')[0];
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(item);
          return acc;
        }, {});
        
        // Xử lý dữ liệu cho mỗi ngày
        const daily = Object.keys(grouped).map(dateKey => {
          const items = grouped[dateKey];
          const maxTemp = Math.max(...items.map(item => item.main.temp));
          const minTemp = Math.min(...items.map(item => item.main.temp));
          // Tính trung bình xác suất mưa (pop, giá trị từ 0 đến 1)
          const avgPop = items.reduce((sum, item) => sum + (item.pop || 0), 0) / items.length;
          // Lấy icon từ item đầu tiên của ngày đó và chuyển sang emoji
          const rawIcon = items[0].weather[0].icon;
          const icon = emojiMapping[rawIcon] || rawIcon;
          // Nếu ngày hiện tại thì hiển thị "Hôm nay", ngược lại lấy tên thứ bằng locale
          const todayKey = new Date().toISOString().split('T')[0];
          const dayLabel = dateKey === todayKey 
            ? 'Hôm nay' 
            : new Date(dateKey).toLocaleDateString('vi-VN', { weekday: 'short' });
          return {
            date: dayLabel,
            maxTemp: Math.round(maxTemp),
            minTemp: Math.round(minTemp),
            rainChance: Math.round(avgPop * 100),
            icon,
          };
        });
        
        setDailyForecasts(daily);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchForecast();
  }, [city, API_KEY]);

  if (error) {
    return (
      <div style={{ 
        color: theme.palette.error.main, 
        padding: '16px', 
        textAlign: 'center'
      }}>
        Lỗi: {error}
      </div>
    );
  }
  
  if (loading) {
    return (
      <div style={{ 
        color: theme.palette.text.secondary, 
        padding: '16px', 
        textAlign: 'center'
      }}>
        Đang tải dự báo thời tiết...
      </div>
    );
  }

  return (
    <ForecastContainer theme={theme}>
      {dailyForecasts.map((day, index) => (
        <ForecastItem key={index} theme={theme}>
          <DayLabel theme={theme}>{day.date}</DayLabel>
          <IconDisplay>{day.icon}</IconDisplay>
          <TempInfo theme={theme}>Cao: {day.maxTemp}°C</TempInfo>
          <TempInfo theme={theme}>Thấp: {day.minTemp}°C</TempInfo>
          <RainInfo theme={theme}>Có mưa: {day.rainChance}%</RainInfo>
        </ForecastItem>
      ))}
    </ForecastContainer>
  );
};

export default WeatherForecastSummary;