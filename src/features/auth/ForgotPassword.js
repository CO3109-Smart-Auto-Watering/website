import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { forgotPassword } from '../../services/authService';

// Styled components với nâng cấp và hỗ trợ theme
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: ${props => props.theme?.palette?.mode === 'dark' ? '#ffffff' : '#333'};
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 25px;
  color: ${props => props.theme?.palette?.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#666'};
  font-size: 15px;
  line-height: 1.5;
  max-width: 450px;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
  svg {
    width: 70px;
    height: 70px;
    color: ${props => props.theme?.palette?.mode === 'dark' ? '#81c784' : '#4a7e2a'};
  }
`;

const Message = styled.div`
  padding: 14px;
  margin-bottom: 25px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background-color: ${props => {
    if (props.isError) {
      return props.theme?.palette?.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#ffebee';
    }
    return props.theme?.palette?.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e9';
  }};
  color: ${props => {
    if (props.isError) {
      return props.theme?.palette?.mode === 'dark' ? '#f48fb1' : '#c62828';
    }
    return props.theme?.palette?.mode === 'dark' ? '#a5d6a7' : '#2e7d32';
  }};
  border: 1px solid ${props => {
    if (props.isError) {
      return props.theme?.palette?.mode === 'dark' ? 'rgba(244, 67, 54, 0.2)' : '#ffcdd2';
    }
    return props.theme?.palette?.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : '#c8e6c9';
  }};
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FormWrapper = styled.form`
  width: 100%;
  margin-bottom: 20px;
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

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    
    // Clear error when user types
    if (errors.email) {
      setErrors({
        ...errors,
        email: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
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
    setMessage('');
    setIsError(false);
    
    try {
      await forgotPassword({ email });
      
      // Hiển thị thông báo thành công
      setMessage('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
      setIsError(false);
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu đặt lại mật khẩu:', error);
      
      if (error.response && error.response.data) {
        setMessage(error.response.data.message || 'Không thể gửi email khôi phục mật khẩu');
      } else if (error.request) {
        setMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setMessage('Đã xảy ra lỗi khi xử lý yêu cầu');
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <IconContainer theme={theme}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </IconContainer>
      
      <Header theme={theme}>Quên mật khẩu?</Header>
      
      <Subtitle theme={theme}>
        Đừng lo lắng! Hãy nhập địa chỉ email của bạn bên dưới và chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu.
      </Subtitle>
      
      {message && (
        <Message isError={isError} theme={theme}>
          {message}
        </Message>
      )}
      
      <FormWrapper onSubmit={handleSubmit}>
        <Input 
          label="Địa chỉ email"
          type="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="Nhập địa chỉ email của bạn"
          theme={theme}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          }
        />
        
        <Button 
          type="submit" 
          fullWidth 
          marginTop="30px"
          marginBottom="20px"
          disabled={isLoading}
          theme={theme}
        >
          {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu đặt lại mật khẩu'}
        </Button>
      </FormWrapper>
      
      <ToggleForm theme={theme}>
        <p>Đã nhớ mật khẩu? <Link to="/login">Quay lại đăng nhập</Link></p>
      </ToggleForm>
    </Container>
  );
};

export default ForgotPassword;