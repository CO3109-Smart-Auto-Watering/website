// src/services/authService.js
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

// Login user
export const loginUser = async (userData) => {
  try {
    const response = await api.post('/login', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (userData) => {
  try {
    const response = await api.post('/forgot-password', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//validateResetToken
export const validateResetToken = async (token) => {
  try {
    const response = await api.get(`/reset-password/validate/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(`/reset-password/${token}`, { password: newPassword });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = async (navigate) => { 
  try {
    await api.post(`/logout`);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // alert("Logout successful!");
    navigate("/login"); // Redirect using useNavigate
  } catch (error) {
    console.error("Logout failed", error);
  }
};
// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const authService = {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  validateResetToken,
  getCurrentUser,
  logoutUser,
  isAuthenticated
};

export default authService;
