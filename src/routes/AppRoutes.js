import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import ForgotPassword from '../features/auth/ForgotPassword';
import ResetPassword from '../features/auth/ResetPassword';
import Dashboard from '../features/dashboard/Dashboard';
import AuthLayout from '../components/layout/AuthLayout';
import smartFarmingImage from '../assets/images/smart-farming.jpg';


// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

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
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;