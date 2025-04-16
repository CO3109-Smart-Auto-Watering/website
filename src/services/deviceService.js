import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  // Add request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

export const registerDevice = async (deviceData) => {
  try {
    const response = await api.post('/devices/register', deviceData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserDevices = async () => {
  try {
    const response = await api.get('/devices');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDeviceById = async (deviceId) => {
  try {
    const response = await api.get(`/devices/${deviceId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDevice = async (deviceId, deviceData) => {
  try {
    const response = await api.put(`/devices/${deviceId}`, deviceData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDevice = async (deviceId) => {
  try {
    const response = await api.delete(`/devices/${deviceId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleDeviceStatus = async (deviceId) => {
  try {
    const response = await api.patch(`/devices/${deviceId}/toggle`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const linkDeviceToPlant = async (deviceId, data) => {
  try {
    const response = await api.post(`/devices/${deviceId}/link-plant`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDeviceData = async (deviceId) => {
  try {
    const response = await api.get(`/devices/${deviceId}/data`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Synchronize device area
export const synchronizeDeviceArea = async (deviceId) => {
  try {
    const response = await api.post(`/devices/${deviceId}/synchronize`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDevicesByArea = async (areaId) => {
  try {
    const response = await api.get(`/devices/area/${areaId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUnassignedDevices = async () => {
  try {
    const response = await api.get('/devices/unassigned');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDeviceAreaMapping = async () => {
  try {
    const response = await api.get('/devices/area-mapping');
    return response.data;
  } catch (error) {
    console.error('Error fetching device-area mappings:', error);
    throw error;
  }
};
