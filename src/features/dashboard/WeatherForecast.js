import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme, Typography, Box, Divider, Paper, Skeleton, Chip, Alert } from '@mui/material';
import { 
  WbSunny, Opacity, AcUnit, Air, Thermostat, CloudQueue, 
  WaterDrop, ArrowUpward, ArrowDownward, QueryBuilder
} from '@mui/icons-material';

// Container chính cho thời tiết hiện tại
const ForecastWrapper = styled(Box)`
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Header có thông tin hiện tại
const CurrentWeatherSection = styled(Box)`
  display: flex;
  padding: 16px;
  border-radius: 16px;
  background: ${props => props.theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${props.theme.palette.primary.dark}, ${props.theme.palette.background.default})` 
    : `linear-gradient(135deg, ${props.theme.palette.primary.light}, ${props.theme.palette.background.paper})`
  };
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
`;

const ForecastContainer = styled(Box)`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 16px;
  padding: 8px 0;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.08)' 
      : 'rgba(0,0,0,0.04)'
    };
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.2)' 
      : 'rgba(0,0,0,0.2)'
    };
    border-radius: 10px;
  }
`;

const ForecastItem = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
  padding: 16px;
  border-radius: 12px;
  background: ${props => props.theme.palette.mode === 'dark' 
    ? props.theme.palette.background.paper
    : props.theme.palette.background.paper
  };
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows[4]};
  }
`;

const DayLabel = styled(Typography)`
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
`;

const IconDisplay = styled.div`
  font-size: 42px;
  margin: 8px 0;
  text-align: center;
`;

const TempRange = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 8px 0;
`;

const WeatherChip = styled(Chip)`
  margin-top: 8px;
`;

const WeatherIconWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.palette.mode === 'dark' 
    ? props.theme.palette.background.paper 
    : props.theme.palette.grey[100]};
  margin-right: 16px;
`;

const WeatherForecast = () => {
  const theme = useTheme();
  const [dailyForecasts, setDailyForecasts] = useState([]);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sử dụng thành phố Ho Chi Minh
  const city = 'Ho Chi Minh';
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'your-api-key-fallback';

  // Mapping từ mã icon của OpenWeatherMap sang emoji và icon
  const weatherMapping = {
    '01d': { emoji: '☀️', label: 'Nắng', icon: <WbSunny color="warning" /> },
    '01n': { emoji: '🌙', label: 'Đêm quang', icon: <WbSunny color="info" /> },
    '02d': { emoji: '⛅', label: 'Ít mây', icon: <CloudQueue color="primary" /> },
    '02n': { emoji: '⛅', label: 'Ít mây', icon: <CloudQueue color="info" /> },
    '03d': { emoji: '☁️', label: 'Có mây', icon: <CloudQueue /> },
    '03n': { emoji: '☁️', label: 'Có mây', icon: <CloudQueue /> },
    '04d': { emoji: '☁️', label: 'Nhiều mây', icon: <CloudQueue color="action" /> },
    '04n': { emoji: '☁️', label: 'Nhiều mây', icon: <CloudQueue color="action" /> },
    '09d': { emoji: '🌧️', label: 'Mưa rào', icon: <Opacity color="info" /> },
    '09n': { emoji: '🌧️', label: 'Mưa rào', icon: <Opacity color="info" /> },
    '10d': { emoji: '🌦️', label: 'Mưa nhẹ', icon: <WaterDrop color="info" /> },
    '10n': { emoji: '🌦️', label: 'Mưa nhẹ', icon: <WaterDrop color="info" /> },
    '11d': { emoji: '⛈️', label: 'Có dông', icon: <Opacity color="error" /> },
    '11n': { emoji: '⛈️', label: 'Có dông', icon: <Opacity color="error" /> },
    '13d': { emoji: '❄️', label: 'Tuyết', icon: <AcUnit color="info" /> },
    '13n': { emoji: '❄️', label: 'Tuyết', icon: <AcUnit color="info" /> },
    '50d': { emoji: '🌫️', label: 'Sương mù', icon: <Air color="disabled" /> },
    '50n': { emoji: '🌫️', label: 'Sương mù', icon: <Air color="disabled" /> },
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu thời tiết hiện tại
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
          throw new Error('Không thể lấy dữ liệu thời tiết hiện tại');
        }
        
        const currentData = await currentResponse.json();
        
        // Định dạng dữ liệu hiện tại
        setCurrentWeather({
          temp: Math.round(currentData.main.temp),
          feels_like: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          wind: currentData.wind.speed,
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          city: currentData.name,
          sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit'
          }),
          sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit'
          }),
          time: new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          })
        });
        
        // Lấy dữ liệu dự báo
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
          throw new Error('Không thể lấy dữ liệu dự báo thời tiết');
        }
        
        const forecastData = await forecastResponse.json();
        
        // Nhóm dữ liệu theo ngày
        const grouped = forecastData.list.reduce((acc, item) => {
          const dateKey = new Date(item.dt * 1000).toISOString().split('T')[0];
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(item);
          return acc;
        }, {});
        
        // Xử lý dữ liệu cho mỗi ngày
        const daily = Object.keys(grouped).slice(0, 7).map(dateKey => {
          const items = grouped[dateKey];
          const maxTemp = Math.max(...items.map(item => item.main.temp));
          const minTemp = Math.min(...items.map(item => item.main.temp));
          const avgPop = items.reduce((sum, item) => sum + (item.pop || 0), 0) / items.length;
          const rawIcon = items[Math.floor(items.length / 2)].weather[0].icon;
          const date = new Date(dateKey);
          const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date);
          const dayNumber = date.getDate();
          const monthName = new Intl.DateTimeFormat('vi-VN', { month: 'short' }).format(date);
          
          return {
            date: dateKey,
            dayName,
            dayNumber,
            monthName,
            maxTemp: Math.round(maxTemp),
            minTemp: Math.round(minTemp),
            pop: Math.round(avgPop * 100), // Xác suất mưa (%)
            icon: rawIcon,
            description: items[Math.floor(items.length / 2)].weather[0].description
          };
        });
        
        setDailyForecasts(daily);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu thời tiết:', error);
        setError('Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchWeatherData();
    
    // Cập nhật dữ liệu mỗi 30 phút
    const intervalId = setInterval(() => {
      fetchWeatherData();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [city, API_KEY]);

  // Format ngày tháng
  const formatDay = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric' }).format(date);
  };
  
  // Hàm lấy icon thời tiết phù hợp
  const getWeatherIcon = (iconCode) => {
    return weatherMapping[iconCode] || { emoji: '⛅', label: 'Không xác định', icon: <CloudQueue /> };
  };

  if (error) {
    return (
      <ForecastWrapper theme={theme}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </ForecastWrapper>
    );
  }
  
  if (loading) {
    return (
      <ForecastWrapper theme={theme}>
        <Skeleton variant="rounded" height={100} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rounded" width={120} height={180} />
          ))}
        </Box>
      </ForecastWrapper>
    );
  }

  return (
    <ForecastWrapper theme={theme}>
      {/* Thời tiết hiện tại */}
      {currentWeather && (
        <CurrentWeatherSection theme={theme}>
          <Box display="flex" width="100%">
            <Box flex="1" display="flex">
              <WeatherIconWrapper theme={theme}>
                {getWeatherIcon(currentWeather.icon).icon}
              </WeatherIconWrapper>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {currentWeather.temp}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cảm giác như: {currentWeather.feels_like}°C
                </Typography>
                <Typography variant="subtitle1" fontWeight="medium" mt={1}>
                  {currentWeather.city} - {getWeatherIcon(currentWeather.icon).label}
                </Typography>
              </Box>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            
            <Box width={150}>
              <Box display="flex" alignItems="center" mb={1}>
                <Opacity sx={{ fontSize: 18, mr: 1, color: 'info.main' }} />
                <Typography variant="body2">
                  Độ ẩm: {currentWeather.humidity}%
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={1}>
                <Air sx={{ fontSize: 18, mr: 1 }} />
                <Typography variant="body2">
                  Gió: {currentWeather.wind} m/s
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <QueryBuilder sx={{ fontSize: 18, mr: 1, color: 'action.active' }} />
                <Typography variant="body2">
                  {currentWeather.time}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CurrentWeatherSection>
      )}
      
      <Typography variant="h6" fontWeight="medium" mt={2} mb={1}>
        Dự báo 5 ngày tới
      </Typography>
      
      <ForecastContainer theme={theme}>
        {dailyForecasts.map((day) => (
          <ForecastItem key={day.date} elevation={1} theme={theme}>
            <DayLabel variant="subtitle2" theme={theme}>
              {day.dayName}, {day.dayNumber} {day.monthName}
            </DayLabel>
            
            <IconDisplay>
              {getWeatherIcon(day.icon).emoji}
            </IconDisplay>
            
            <WeatherChip 
              label={getWeatherIcon(day.icon).label}
              size="small"
              color={day.icon.includes('01') ? 'warning' : day.icon.includes('09') || day.icon.includes('10') ? 'info' : 'default'}
              icon={getWeatherIcon(day.icon).icon}
            />
            
            <TempRange>
              <Box display="flex" alignItems="center">
                <ArrowUpward fontSize="small" color="error" />
                <Typography color="error.main" fontWeight="medium">
                  {day.maxTemp}°
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <ArrowDownward fontSize="small" color="info" />
                <Typography color="info.main" fontWeight="medium">
                  {day.minTemp}°
                </Typography>
              </Box>
            </TempRange>
            
            {day.pop > 0 && (
              <Box display="flex" alignItems="center" mt={1}>
                <Opacity fontSize="small" color="info" sx={{ mr: 0.5 }} />
                <Typography variant="caption" color="info.main">
                  {day.pop}% mưa
                </Typography>
              </Box>
            )}
          </ForecastItem>
        ))}
      </ForecastContainer>
    </ForecastWrapper>
  );
};

export default WeatherForecast;