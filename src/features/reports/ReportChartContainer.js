import React from 'react';
import styled from 'styled-components';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa';

const ChartsContainer = styled.div`
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ChartHeader = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #4975d1;
  }
`;

const ChartTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #333;
`;

const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  text-align: center;
  
  svg {
    font-size: 36px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

const COLORS = ['#4975d1', '#ff7300', '#82ca9d', '#8884d8', '#ffc658'];

const ReportChartContainer = ({ sensorData, wateringEvents, dataType }) => {
  // Format dates for display
  const formattedSensorData = sensorData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }));
  
  // Check if we should display each chart type
  const showTemperatureChart = (dataType === 'all' || dataType === 'temperature') && 
                               sensorData.some(item => item.temperature !== undefined);
                               
  const showHumidityChart = (dataType === 'all' || dataType === 'humidity') && 
                            sensorData.some(item => item.humidity !== undefined);
                            
  const showSoilMoistureChart = (dataType === 'all' || dataType === 'soil') && 
                                sensorData.some(item => item.soilMoisture !== undefined);
                                
  const showWateringChart = (dataType === 'all' || dataType === 'watering') && 
                           wateringEvents.length > 0;

  // Process data for watering chart
  const wateringByDay = {};
  
  wateringEvents.forEach(event => {
    const date = new Date(event.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    
    if (!wateringByDay[date]) {
      wateringByDay[date] = {
        date,
        count: 0,
        duration: 0,
        waterUsed: 0
      };
    }
    
    wateringByDay[date].count += 1;
    wateringByDay[date].duration += event.duration;
    wateringByDay[date].waterUsed += event.waterUsed;
  });
  
  const wateringChartData = Object.values(wateringByDay);
  
  // Process data for watering distribution by zone
  const wateringByZone = {};
  
  wateringEvents.forEach(event => {
    if (!wateringByZone[event.zone]) {
      wateringByZone[event.zone] = 0;
    }
    
    wateringByZone[event.zone] += event.waterUsed;
  });
  
  const distributionData = Object.keys(wateringByZone).map(zone => ({
    name: zone,
    value: wateringByZone[zone]
  }));
  
  // Process data for manual vs automatic distribution
  const wateringByType = {
    'Tự động': 0,
    'Thủ công': 0
  };
  
  wateringEvents.forEach(event => {
    const type = event.trigger === 'automatic' ? 'Tự động' : 'Thủ công';
    wateringByType[type] += event.waterUsed;
  });
  
  const typeDistributionData = Object.keys(wateringByType).map(type => ({
    name: type,
    value: wateringByType[type]
  }));

  return (
    <ChartsContainer>
      {/* Temperature chart */}
      {showTemperatureChart && (
        <ChartCard>
          <ChartHeader>
            <FaChartLine />
            <ChartTitle>Biểu đồ nhiệt độ</ChartTitle>
          </ChartHeader>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={formattedSensorData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Nhiệt độ (°C)"
                stroke="#ff7300"
                activeDot={{ r: 8 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Humidity chart */}
      {showHumidityChart && (
        <ChartCard>
          <ChartHeader>
            <FaChartLine />
            <ChartTitle>Biểu đồ độ ẩm không khí</ChartTitle>
          </ChartHeader>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={formattedSensorData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="humidity"
                name="Độ ẩm không khí (%)"
                stroke="#4975d1"
                activeDot={{ r: 8 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Soil moisture chart */}
      {showSoilMoistureChart && (
        <ChartCard>
          <ChartHeader>
            <FaChartLine />
            <ChartTitle>Biểu đồ độ ẩm đất</ChartTitle>
          </ChartHeader>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={formattedSensorData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="soilMoisture"
                name="Độ ẩm đất (%)"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Watering chart */}
      {showWateringChart && (
        <ChartCard>
          <ChartHeader>
            <FaChartBar />
            <ChartTitle>Thống kê tưới nước theo ngày</ChartTitle>
          </ChartHeader>
          
          {wateringChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={wateringChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#4975d1" />
                <YAxis yAxisId="right" orientation="right" stroke="#ff7300" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="waterUsed"
                  name="Lượng nước (lít)"
                  fill="#4975d1"
                  isAnimationActive={false}
                />
                <Bar
                  yAxisId="right"
                  dataKey="duration"
                  name="Thời gian tưới (phút)"
                  fill="#ff7300"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage>
              <FaChartBar />
              <p>Không có dữ liệu tưới nước</p>
            </NoDataMessage>
          )}
        </ChartCard>
      )}
      
      {/* Water distribution by zone */}
      {showWateringChart && distributionData.length > 0 && (
        <ChartCard>
          <ChartHeader>
            <FaChartPie />
            <ChartTitle>Phân bố sử dụng nước theo khu vực</ChartTitle>
          </ChartHeader>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                isAnimationActive={false}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(1)} lít`} />
              <Legend formatter={(value) => `${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
      
      {/* Water distribution by type (automatic vs manual) */}
      {showWateringChart && typeDistributionData.length > 0 && (
        <ChartCard>
          <ChartHeader>
            <FaChartPie />
            <ChartTitle>Phân bố kiểu tưới (tự động/thủ công)</ChartTitle>
          </ChartHeader>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                isAnimationActive={false}
              >
                <Cell fill="#4975d1" /> {/* Auto */}
                <Cell fill="#ff7300" /> {/* Manual */}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(1)} lít`} />
              <Legend formatter={(value) => `${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </ChartsContainer>
  );
};

export default ReportChartContainer;