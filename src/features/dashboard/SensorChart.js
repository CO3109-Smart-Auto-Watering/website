import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

const SensorChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSensorData = async (feedName) => {
      try {
        const response = await fetch(
          `https://io.adafruit.com/api/v2/${process.env.REACT_APP_AIO_USERNAME}/feeds/${feedName}/data?limit=1`,
          {
            headers: { 'X-AIO-Key': process.env.REACT_APP_AIO_KEY },
          }
        );
        const jsonData = await response.json();
        return jsonData.length > 0 ? parseFloat(jsonData[0].value) : null;
      } catch (error) {
        console.error(`Error fetching ${feedName}:`, error);
        return null;
      }
    };

    const fetchData = async () => {
      const temperature = await fetchSensorData('sensor-temp');
      const humidity = await fetchSensorData('sensor-humidity');
      const soilMoisture = await fetchSensorData('sensor-soil');

      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        temperature,
        humidity,
        soilMoisture,
      };

      // Cập nhật state với 10 bản ghi cuối cùng
      setData(prevData => [...prevData, newDataPoint].slice(-10));
    };

    // Lấy dữ liệu ngay khi component mount và cập nhật mỗi 5 giây
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

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
