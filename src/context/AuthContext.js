import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, verifyToken, logoutUser } from '../services/authService';

// Tạo context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Kiểm tra phiên đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Xác thực token
        await verifyToken();
        
        // Lấy thông tin người dùng
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        setUserRole(userData.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Lỗi xác thực:', error);
        // Xử lý token không hợp lệ hoặc hết hạn
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Đăng nhập
  const login = async (userData) => {
    setCurrentUser(userData);
    setUserRole(userData.role);
    setIsAuthenticated(true);
  };

  // Đăng xuất
  const logout = () => {
    logoutUser();
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    isAuthenticated,
    userRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};