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

export const getHistoricalData = async (feedName, limit = 24, deviceId = null) => {
  try {
    const token = localStorage.getItem('token');
    
    // Xây dựng endpoint dựa trên deviceId
    let endpoint = deviceId 
      ? `${API_URL}/sensor-data/${deviceId}/history/${feedName}` 
      : `${API_URL}/sensor-data/history/${feedName}`;
    
    // Thêm limit vào query params
    endpoint += `?limit=${limit}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching historical data for ${feedName}:`, error);
    throw error;
  }
};

// Send command to Adafruit (e.g., control pump, set mode)
export const sendCommand = async (feedName, value, deviceId = null) => {
  try {
    const token = localStorage.getItem('token');
    
    // Sử dụng endpoint khác nhau dựa trên deviceId
    const endpoint = deviceId
      ? `${API_URL}/sensor-data/${deviceId}/command`
      : `${API_URL}/sensor-data/command`;
    
    // Cấu trúc request body theo endpoint
    const payload = {
      feedName,
      value
    };
    
    if (deviceId) {
      payload.deviceId = deviceId;
    }
    
    const response = await axios.post(
      endpoint,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error sending command to ${feedName}${deviceId ? ' for device '+deviceId : ''}:`, error);
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

export const setActiveDevice = async (deviceId) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${API_URL}/sensor-data/set-active-device`,
      { deviceId },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error setting active device ${deviceId}:`, error);
    throw error;
  }
};


const sensorService = {
  getLatestSensorData,
  sendCommand,
  getAdafruitFeedData,
  setActiveDevice,
  getHistoricalData
};

export default sensorService;