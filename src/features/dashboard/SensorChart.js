import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { getHistoricalData } from '../../services/sensorService';

const SensorChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        
        // Get historical data for each sensor (last 24 data points)
        const tempResponse = await getHistoricalData('sensor-temp', 24);
        const humidityResponse = await getHistoricalData('sensor-humidity', 24);
        const soilResponse = await getHistoricalData('sensor-soil', 24);
        
        // Extract the actual data arrays from the response
        const tempData = tempResponse.data || [];
        const humidityData = humidityResponse.data || [];
        const soilData = soilResponse.data || [];
        
        console.log("Temp data:", tempData);
        console.log("Humidity data:", humidityData);
        console.log("Soil data:", soilData);
        
        // Create a map to combine data by timestamp
        const dataMap = {};
        
        // Process temperature data
        tempData.forEach(item => {
          const timestamp = new Date(item.createdAt);
          const timeKey = timestamp.toISOString();
          const timeDisplay = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          dataMap[timeKey] = {
            time: timeDisplay,
            temperature: parseFloat(item.value),
          };
        });
        
        // Process humidity data
        humidityData.forEach(item => {
          const timestamp = new Date(item.createdAt);
          const timeKey = timestamp.toISOString();
          const timeDisplay = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          if (dataMap[timeKey]) {
            dataMap[timeKey].humidity = parseFloat(item.value);
          } else {
            dataMap[timeKey] = {
              time: timeDisplay,
              humidity: parseFloat(item.value),
            };
          }
        });
        
        // Process soil moisture data
        soilData.forEach(item => {
          const timestamp = new Date(item.createdAt);
          const timeKey = timestamp.toISOString();
          const timeDisplay = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          if (dataMap[timeKey]) {
            dataMap[timeKey].soilMoisture = parseFloat(item.value);
          } else {
            dataMap[timeKey] = {
              time: timeDisplay,
              soilMoisture: parseFloat(item.value),
            };
          }
        });
        
        // Convert to array and sort by timestamp
        const combinedData = Object.values(dataMap).sort((a, b) => {
          return new Date(a.time) - new Date(b.time);
        });
        
        console.log("Combined data for chart:", combinedData);
        setData(combinedData);
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
    const intervalId = setInterval(fetchHistoricalData, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  if (error) return <div>Error loading chart data: {error}</div>;
  if (loading && data.length === 0) return <div>Loading chart data...</div>;
  
  // If no data available, show message
  if (data.length === 0) {
    return <div>No historical data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="temperature" stroke="#FF8042" activeDot={{ r: 6 }} name="Nhiệt độ (°C)" />
        <Line type="monotone" dataKey="humidity" stroke="#0088FE" activeDot={{ r: 6 }} name="Độ ẩm không khí (%)" />
        <Line type="monotone" dataKey="soilMoisture" stroke="#00C49F" activeDot={{ r: 6 }} name="Độ ẩm đất (%)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SensorChart;