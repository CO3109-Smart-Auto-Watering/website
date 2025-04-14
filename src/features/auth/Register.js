import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';
import { registerUser } from '../../services/authService';

const Header = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: ${props => props.theme?.palette?.mode === 'dark' ? '#ffffff' : '#333'};
`;

// Phần styled component ToggleForm
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

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
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
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({
          ...errors,
          submit: error.response.data.message || 'Đăng ký thất bại'
        });
      } else {
        setErrors({
          ...errors,
          submit: 'Đã xảy ra lỗi khi đăng ký'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header>Đăng ký tài khoản</Header>
      
      <form onSubmit={handleSubmit}>
        <Input 
          label="Tên đăng nhập"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          error={errors.username}
        />
        
        <Input 
          label="Địa chỉ email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
        />
        
        <Input 
          label="Mật khẩu"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
        />
        
        <Input 
          label="Xác nhận mật khẩu"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
        />
        
        <Checkbox
          name="agreeTerms"
          label="Tôi đồng ý với điều khoản sử dụng"
          checked={formData.agreeTerms}
          onChange={handleInputChange}
        />
        {errors.agreeTerms && (
          <div style={{ color: '#dc3545', marginTop: '-15px', marginBottom: '15px', fontSize: '12px' }}>
            {errors.agreeTerms}
          </div>
        )}
        
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
          {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
        </Button>
      </form>
      
      <ToggleForm>
        <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </ToggleForm>
    </>
  );
};

export default Register;