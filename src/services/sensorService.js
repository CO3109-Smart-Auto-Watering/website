import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get latesgetLatestSensorData sensor data
export const getLatestSensorData = async (deviceId = null) => {
  const token = localStorage.getItem('token');
  try {
    const endpoint = deviceId 
      ? `${API_URL}/sensor-data/${deviceId}/latest` 
      : `${API_URL}/sensor-data/latest`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'x-auth-token': token
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching latest sensor data${deviceId ? ' for device '+deviceId : ''}:`, error);
    throw error;
  }
};

// Get historical data for a specific feed
export const getHistoricalData = async (feedName, limit = 24, deviceId = null) => {
  const token = localStorage.getItem('token');
  try {
    const endpoint = deviceId
      ? `${API_URL}/sensor-data/${deviceId}/history/${feedName}?limit=${limit}`
      : `${API_URL}/sensor-data/history/${feedName}?limit=${limit}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'x-auth-token': token
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching historical data for ${feedName}${deviceId ? ' of device '+deviceId : ''}:`, error);
    throw error;
  } 
};

// Send command to Adafruit (e.g., control pump, set mode)
export const sendCommand = async (feedName, value) => {
  try {
    const token = localStorage.getItem('token');
    
    // Sử dụng axios trực tiếp thay vì api instance để đảm bảo token được gửi
    const response = await axios.post(
      `${API_URL}/sensor-data/command`,
      {
        feedName,
        value
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error sending command to ${feedName}:`, error);
    throw error;
  }
};

// Set irrigation schedule
export const setSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error setting schedule:', error);
    throw error;
  }
};

export const getAdafruitFeedData = async (feedName, deviceId = null) => {
  try {
    const token = localStorage.getItem('token');
    
    const endpoint = deviceId
      ? `${API_URL}/sensor-data/${deviceId}/feed/${feedName}`
      : `${API_URL}/sensor-data/feed/${feedName}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'x-auth-token': token
      }
    });
    
    // Axios tự động chuyển response thành JSON
    const data = response.data;
    
    if (data.success && data.value !== undefined) {
      return data.value;
    } else {
      console.error(`Error fetching Adafruit data for ${feedName}${deviceId ? ' of device '+deviceId : ''}:`, data.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error(`Error fetching Adafruit data for ${feedName}${deviceId ? ' of device '+deviceId : ''}:`, error);
    return null;
  }
};


const sensorService = {
  getLatestSensorData,
  sendCommand,
  setSchedule,
  getAdafruitFeedData,
};

export default sensorService;