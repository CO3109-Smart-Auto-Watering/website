import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateResetToken, resetPassword } from '../../services/authService';

// Styled Components with theme support
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.h2`
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 20px;
  color: ${props => props.theme.palette.text.primary};
  text-align: center;
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 25px;
  color: ${props => props.theme.palette.text.secondary};
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
    color: ${props => props.theme.palette.primary.main};
  }
`;

const Message = styled.div`
  padding: 14px;
  margin-bottom: 25px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background-color: ${props => props.isError 
    ? (props.theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.15)' : '#ffebee')
    : (props.theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9')};
  color: ${props => props.isError 
    ? (props.theme.palette.mode === 'dark' ? '#f48fb1' : '#c62828')
    : (props.theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32')};
  border: 1px solid ${props => props.isError 
    ? (props.theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.3)' : '#ffcdd2')
    : (props.theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : '#c8e6c9')};
  width: 100%;
  box-shadow: 0 2px 4px ${props => props.theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(0, 0, 0, 0.05)'};
`;

const FormWrapper = styled.form`
  width: 100%;
  margin-bottom: 20px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  margin: 30px 0;
  svg {
    animation: spin 1s linear infinite;
    width: 40px;
    height: 40px;
    color: ${props => props.theme.palette.primary.main};
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PasswordRequirements = styled.ul`
  margin-bottom: 20px;
  padding-left: 20px;
  font-size: 14px;
  color: ${props => props.theme.palette.text.secondary};
`;

const ResetPassword = () => {
  const theme = useTheme();
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const validateToken = async () => {
      try {
        setIsValidating(true);
        console.log('Validating token:', token);
        
        // Kiểm tra xem API endpoint có tồn tại không
        const response = await validateResetToken(token);
        
        console.log('Validation response:', response.data);
        
        setIsTokenValid(true);
        setIsValidating(false);
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
        setIsValidating(false);
        setIsError(true);
        setMessage('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }
    };
  
    validateToken();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value
    });
    
    // Clear errors
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate password
    if (passwords.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    
    // Validate confirmPassword
    if (passwords.password !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      // Use API base URL from environment if available
      const response = await resetPassword(token, passwords.password);
      
      setMessage('Mật khẩu đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập...');
      setIsError(false);
      setIsLoading(false);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.');
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <Container>
        <IconContainer theme={theme}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </IconContainer>
        <Header theme={theme}>Đặt lại mật khẩu</Header>
        <Subtitle theme={theme}>Đang xác thực liên kết đặt lại mật khẩu...</Subtitle>
        <LoadingContainer theme={theme}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </LoadingContainer>
      </Container>
    );
  }

  if (!isTokenValid) {
    return (
      <Container>
        <IconContainer theme={theme}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </IconContainer>
        <Header theme={theme}>Đặt lại mật khẩu</Header>
        <Message isError={true} theme={theme}>{message}</Message>
        <Button 
          onClick={() => navigate('/forgot-password')}
          fullWidth
        >
          Yêu cầu liên kết mới
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <IconContainer theme={theme}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </IconContainer>
      
      <Header theme={theme}>Đặt lại mật khẩu</Header>
      <Subtitle theme={theme}>Vui lòng nhập mật khẩu mới cho tài khoản của bạn</Subtitle>
      
      {message && (
        <Message isError={isError} theme={theme}>
          {message}
        </Message>
      )}
      
      <FormWrapper onSubmit={handleSubmit}>
        <PasswordRequirements theme={theme}>
          <li>Mật khẩu phải có ít nhất 8 ký tự</li>
          <li>Nên kết hợp chữ cái, số và ký tự đặc biệt</li>
        </PasswordRequirements>
        
        <Input 
          label="Mật khẩu mới"
          type="password"
          name="password"
          value={passwords.password}
          onChange={handleInputChange}
          error={errors.password}
          placeholder="Nhập mật khẩu mới"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
          theme={theme}
        />
        
        <Input 
          label="Xác nhận mật khẩu"
          type="password"
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          placeholder="Nhập lại mật khẩu mới"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          }
          theme={theme}
        />
        
        <Button 
          type="submit" 
          fullWidth 
          marginTop="30px"
          marginBottom="20px"
          disabled={isLoading}
          theme={theme}
        >
          {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </Button>
      </FormWrapper>
    </Container>
  );
};

export default ResetPassword;