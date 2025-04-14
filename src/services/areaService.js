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

export const getAreas = async () => {
  try {
    const response = await api.get('/areas');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAreaById = async (areaId) => {
  try {
    const response = await api.get(`/areas/${areaId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createArea = async (areaData) => {
  try {
    const response = await api.post('/areas', areaData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateArea = async (areaId, areaData) => {
  try {
    const response = await api.put(`/areas/${areaId}`, areaData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteArea = async (areaId) => {
  try {
    const response = await api.delete(`/areas/${areaId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addPlantToArea = async (areaId, plantData) => {
  try {
    const response = await api.post(`/areas/${areaId}/plants`, plantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePlantInArea = async (areaId, plantIndex, plantData) => {
  try {
    const response = await api.put(`/areas/${areaId}/plants/${plantIndex}`, plantData);
    return response.data;
  } catch (error) {
    console.error('Error updating plant in area:', error);
    throw error;
  }
};

export const deletePlantFromArea = async (areaId, plantIndex) => {
  try {
    const response = await api.delete(`/areas/${areaId}/plants/${plantIndex}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting plant from area:', error);
    throw error;
  }
};

export const updateDeviceInArea = async (areaId, data) => {
  try {
    const response = await api.post(`/areas/${areaId}/devices`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};