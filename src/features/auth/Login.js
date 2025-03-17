import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';
import { loginUser } from '../../services/authService';

const Header = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
`;

const RoleToggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const RoleButton = styled.button`
  padding: 8px 20px;
  background-color: ${props => props.active ? 'white' : '#f5f5f5'};
  border: 1px solid #ddd;
  border-bottom: ${props => props.active ? '2px solid #4a7e2a' : '1px solid #ddd'};
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

const ForgotPassword = styled.div`
  text-align: right;
  font-size: 12px;
  margin-top: -10px;
  margin-bottom: 20px;
  
  a {
    color: #4975d1;
    text-decoration: none;
  }
`;

const ToggleForm = styled.div`
  text-align: center;
  font-size: 14px;
  color: #666;
  
  a {
    color: #4975d1;
    text-decoration: none;
    font-weight: bold;
  }
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('user');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});

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
    
    try {
        const response = await loginUser({
          username: formData.username,
          password: formData.password,
          role: activeRole
        });
        
        // Lưu token và vai trò từ phản hồi API
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.user.role);
        
        // Chuyển hướng dựa trên vai trò từ API
        if (response.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({
          ...errors,
          submit: error.response.data.message || 'Đăng nhập thất bại'
        });
      } else {
        setErrors({
          ...errors,
          submit: 'Đã xảy ra lỗi khi đăng nhập'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header>Đăng nhập tài khoản</Header>
      
      <RoleToggle>
        <RoleButton 
          active={activeRole === 'user'} 
          onClick={() => setActiveRole('user')}
        >
          <UserIcon /> User
        </RoleButton>
        <RoleButton 
          active={activeRole === 'admin'} 
          onClick={() => setActiveRole('admin')}
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
        />
        
        <Input 
          label="Mật khẩu"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
        />
        
        <ForgotPassword>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </ForgotPassword>
        
        <Checkbox
          name="rememberMe"
          label="Ghi nhớ đăng nhập"
          checked={formData.rememberMe}
          onChange={handleInputChange}
        />
        
        {errors.submit && (
          <div style={{ color: '#dc3545', marginBottom: '10px' }}>
            {errors.submit}
          </div>
        )}
        
        <Button 
          type="submit" 
          fullWidth 
          marginBottom="20px"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
        </Button>
      </form>
      
      <ToggleForm>
        <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </ToggleForm>
    </>
  );
};

export default Login;