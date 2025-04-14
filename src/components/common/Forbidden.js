import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import Button from './Button';

const Container = styled.div`
  text-align: center;
  max-width: 500px;
  margin: 100px auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: ${props => props.theme.palette.error.main};
  font-size: 32px;
  margin-bottom: 20px;
`;

const Message = styled.p`
  color: ${props => props.theme.palette.text.primary};
  font-size: 18px;
  margin-bottom: 30px;
`;

const Forbidden = () => {
  const theme = useTheme();
  
  return (
    <Container>
      <Title theme={theme}>403 - Truy cập bị từ chối</Title>
      <Message theme={theme}>
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là một lỗi.
      </Message>
      <Button 
        as={Link} 
        to="/dashboard"
        theme={theme}
      >
        Quay về trang chủ
      </Button>
    </Container>
  );
};

export default Forbidden;