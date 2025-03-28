import React from 'react';
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import ForgotPassword from '../features/auth/ForgotPassword';
import ResetPassword from '../features/auth/ResetPassword';
import Dashboard from '../features/dashboard/Dashboard';
import AuthLayout from '../components/layout/AuthLayout';
import smartFarmingImage from '../assets/images/smart-farming.jpg';
import AdminDashboard from '../features/dashboard/AdminDashboard';
import DeviceList from '../components/DeviceList';
import Users from '../features/users/Users';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  const userRole = getUserRole();

  useEffect(() => {
    if (!userRole || !allowedRoles.includes(userRole)) {
      alert("You don't have access to this page");
    }
  }, [isAuthenticated, userRole, allowedRoles]);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  
  return children;
};

export const getUserRole = () => {
  const role = localStorage.getItem("role");
  return role;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <AuthLayout image={smartFarmingImage}>
          <Login />
        </AuthLayout>
      } />
      <Route path="/register" element={
        <AuthLayout image={smartFarmingImage}>
          <Register />
        </AuthLayout>
      } />
      <Route path="/forgot-password" element={
        <AuthLayout image={smartFarmingImage}>
          <ForgotPassword />
        </AuthLayout>
      } />
       <Route path="/reset-password/:token" element={
        <AuthLayout image={smartFarmingImage}>
          <ResetPassword />
        </AuthLayout>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={["user"]}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/devices-list" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <DeviceList />
        </ProtectedRoute>
      } />
    
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;