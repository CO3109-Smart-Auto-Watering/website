// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Thêm interceptor để tự động thêm token vào header
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

// Đăng nhập
export const loginUser = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Đăng ký
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Quên mật khẩu
export const forgotPassword = async (email) => {
  try {
    let payload;
    
    if (typeof email === 'string') {
      payload = { email }; 
    } else {
      payload = email; 
    }
    
    const response = await api.post('/auth/forgot-password', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Xác thực token reset mật khẩu
export const validateResetToken = async (token) => {
  try {
    const response = await api.get(`/auth/reset-password/validate/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset mật khẩu
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Đăng xuất
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  // Các bước đăng xuất khác
};

// Kiểm tra token hợp lệ
export const verifyToken = async () => {
  try {
    const response = await api.post('/auth/verify');
    return response.data;
  } catch (error) {
    // Nếu token không hợp lệ, xóa token và trả về false
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    throw error;
  }
};

// Kiểm tra xem người dùng đã đăng nhập hay chưa
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
