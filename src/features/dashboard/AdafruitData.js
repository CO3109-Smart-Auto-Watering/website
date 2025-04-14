import React, { useState, useEffect } from 'react';
import { getLatestSensorData } from '../../services/sensorService';

const AdafruitData = ({ feedName }) => {
  const [value, setValue] = useState('--');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log("Fetching sensor data for:", feedName);
    
    const fetchData = async () => {
      try {
        const response = await getLatestSensorData();
        console.log("API response:", response);
        
        if (response && response.data && response.data[feedName]) {
          setValue(response.data[feedName].value);
        } else {
          console.error("No data for feed:", feedName);
          setValue('--');
        }
      } catch (err) {
        console.error("Error fetching sensor data:", err);
        setError(err);
        setValue('--');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling to refresh data periodically
    const interval = setInterval(fetchData, 10000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [feedName]);

  if (loading) return <span>--</span>;
  if (error) return <span>--</span>;
  
  return <>{value}</>;
};

export default AdafruitData;