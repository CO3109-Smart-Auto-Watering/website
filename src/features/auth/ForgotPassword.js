import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { forgotPassword } from '../../services/authService';

// Styled components với nâng cấp
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.h2`
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 25px;
  color: #666;
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
    color: #4975d1;
  }
`;

const Message = styled.div`
  padding: 14px;
  margin-bottom: 25px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  background-color: ${props => props.isError ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.isError ? '#c62828' : '#2e7d32'};
  border: 1px solid ${props => props.isError ? '#ffcdd2' : '#c8e6c9'};
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FormWrapper = styled.form`
  width: 100%;
  margin-bottom: 20px;
`;

const ToggleForm = styled.div`
  text-align: center;
  font-size: 15px;
  color: #666;
  margin-top: 10px;
  
  a {
    color: #4975d1;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover {
      color: #3764c0;
      text-decoration: underline;
    }
  }
`;

const ForgotPassword = () => {
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
      if (error.response && error.response.data) {
        setMessage(error.response.data.message || 'Không thể gửi email khôi phục mật khẩu');
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
      <IconContainer>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </IconContainer>
      
      <Header>Quên mật khẩu?</Header>
      
      <Subtitle>
        Đừng lo lắng! Hãy nhập địa chỉ email của bạn bên dưới và chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu.
      </Subtitle>
      
      {message && (
        <Message isError={isError}>
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
        >
          {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu đặt lại mật khẩu'}
        </Button>
      </FormWrapper>
      
      <ToggleForm>
        <p>Đã nhớ mật khẩu? <Link to="/login">Quay lại đăng nhập</Link></p>
      </ToggleForm>
    </Container>
  );
};

export default ForgotPassword;