import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Header = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: ${props => props.theme?.palette?.mode === 'dark' ? '#ffffff' : '#333'};
`;

const RoleToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px ${props => props.theme?.palette?.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 4px;
`;

const RoleButton = styled.button`
  padding: 10px 24px;
  background-color: ${props => {
    // Nếu là dark mode
    if (props.theme?.palette?.mode === 'dark') {
      return props.active ? '#2e7d32' : 'rgba(255, 255, 255, 0.08)';
    }
    // Light mode
    return props.active ? '#4a7e2a' : '#f5f5f5';
  }};
  border: 1px solid ${props => props.theme?.palette?.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : '#ddd'};
  border-bottom: ${props => props.active 
    ? `2px solid ${props.theme?.palette?.mode === 'dark' ? '#81c784' : '#4a7e2a'}` 
    : `1px solid ${props.theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#ddd'}`};
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => {
    // Nếu là dark mode
    if (props.theme?.palette?.mode === 'dark') {
      return props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
    }
    // Light mode
    return props.active ? '#ffffff' : '#666';
  }};
  transition: all 0.2s ease;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
  
  &:hover {
    background-color: ${props => {
      // Nếu là dark mode
      if (props.theme?.palette?.mode === 'dark') {
        return props.active ? '#388e3c' : 'rgba(255, 255, 255, 0.12)';
      }
      // Light mode
      return props.active ? '#3d6b23' : '#e8e8e8';
    }};
  }
  
  svg {
    color: ${props => {
      // Nếu là dark mode
      if (props.theme?.palette?.mode === 'dark') {
        return props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      }
      // Light mode
      return props.active ? '#ffffff' : '#666';
    }};
  }
`;

const ForgotPassword = styled.div`
  text-align: right;
  font-size: 12px;
  margin-top: -10px;
  margin-bottom: 20px;
  
  a {
    color: ${props => props.theme?.palette?.mode === 'dark' ? '#81c784' : '#4a7e2a'};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ToggleForm = styled.div`
  text-align: center;
  font-size: 14px;
  color: ${props => props.theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#666'};
  
  a {
    color: ${props => props.theme?.palette?.mode === 'dark' ? '#81c784' : '#4a7e2a'};
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme?.palette?.mode === 'dark' ? '#f48fb1' : '#dc3545'};
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: ${props => props.theme?.palette?.mode === 'dark' 
    ? 'rgba(244, 67, 54, 0.1)' 
    : 'rgba(220, 53, 69, 0.05)'};
  font-size: 14px;
  border-left: 3px solid ${props => props.theme?.palette?.mode === 'dark' 
    ? '#f48fb1' 
    : '#dc3545'};
`;

// Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('user');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  
  // Lấy đường dẫn chuyển hướng từ state nếu có
  const from = location.state?.from?.pathname || '/dashboard';

  // Kiểm tra thông tin đăng nhập đã lưu
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setFormData(prev => ({
        ...prev,
        username: rememberedUser,
        rememberMe: true
      }));
    }
    
    // Lấy role đã lưu nếu có
    const savedRole = localStorage.getItem('lastRole');
    if (savedRole && (savedRole === 'user' || savedRole === 'admin')) {
      setActiveRole(savedRole);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({...errors, submit: ''}); // Xóa lỗi trước đó
    
    try {
      console.log('Đang gửi thông tin đăng nhập:', {
        username: formData.username,
        role: activeRole
      });
      
      const response = await loginUser({
        username: formData.username,
        password: formData.password,
        role: activeRole
      });
      
      // Lưu token vào localStorage
      localStorage.setItem('token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      // Lưu thông tin user vào context
      await login(response.user || { username: formData.username, role: activeRole });
      
      // Lưu "remember me" nếu được chọn
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUser', formData.username);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      
      // Lưu role cuối cùng
      localStorage.setItem('lastRole', activeRole);
      
      // Chuyển hướng dựa trên vai trò
      const redirectPath = activeRole === 'admin' ? '/admin/dashboard' : '/dashboard';
      
      // Nếu từ một trang khác đến, quay lại trang đó
      navigate(from !== '/login' ? from : redirectPath, { replace: true });
      
      console.log('Đăng nhập thành công, chuyển hướng đến:', redirectPath);
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      
      let errorMessage = 'Đăng nhập thất bại';
      
      if (error.response) {
        // Lỗi từ server với status code
        if (error.response.status === 401) {
          errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác';
        } else if (error.response.status === 403) {
          errorMessage = 'Tài khoản của bạn không có quyền truy cập';
        } else if (error.response.status === 429) {
          errorMessage = 'Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        errorMessage = 'Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        ...errors,
        submit: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header theme={theme}>Đăng nhập tài khoản</Header>
      
      <RoleToggle theme={theme}>
        <RoleButton 
          active={activeRole === 'user'} 
          onClick={() => setActiveRole('user')}
          theme={theme}
        >
          <UserIcon /> User
        </RoleButton>
        <RoleButton 
          active={activeRole === 'admin'} 
          onClick={() => setActiveRole('admin')}
          theme={theme}
        >
          <AdminIcon /> Admin
        </RoleButton>
      </RoleToggle>
      
      <form onSubmit={handleSubmit}>
        <Input 
          label="Tên đăng nhập"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          error={errors.username}
          theme={theme}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          }
        />
        
        <Input 
          label="Mật khẩu"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          theme={theme}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          }
        />
        
        <ForgotPassword theme={theme}>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </ForgotPassword>
        
        <Checkbox
          name="rememberMe"
          label="Ghi nhớ đăng nhập"
          checked={formData.rememberMe}
          onChange={handleInputChange}
          theme={theme}
        />
        
        {errors.submit && (
          <ErrorMessage theme={theme}>
            {errors.submit}
          </ErrorMessage>
        )}
        
        <Button 
          type="submit" 
          fullWidth 
          marginBottom="20px"
          disabled={isLoading}
          theme={theme}
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
        </Button>
      </form>
      
      <ToggleForm theme={theme}>
        <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </ToggleForm>
    </>
  );
};

export default Login;