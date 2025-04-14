import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import ForgotPassword from '../features/auth/ForgotPassword';
import ResetPassword from '../features/auth/ResetPassword';
import Dashboard from '../features/dashboard/Dashboard';
import ScheduleManager from '../features/schedule/ScheduleManager';
import DeviceManager from '../features/devices/DeviceManager';
import ReportsAnalytics from '../features/reports/ReportsAnalytics';
import AuthLayout from '../components/layout/AuthLayout';
import Layout from '../components/layout/Layout';
import Settings from '../features/setting/Settings';
import AreaManager from '../features/areas/AreaManager';
import { useAuth } from '../context/AuthContext';
import NotFound from '../components/common/NotFound';
import Forbidden from '../components/common/Forbidden';
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
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      {/* Add Schedule Management Route */}
      <Route path="/schedules" element={
        <ProtectedRoute>
          <Layout>
            <ScheduleManager />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/devices" element={
        <ProtectedRoute>
          <Layout>
            <DeviceManager />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <ReportsAnalytics />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/areas" element={
        <ProtectedRoute>
          <Layout>
            <AreaManager />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;