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
  color: ${props => props.theme.palette.primary.main};
  font-size: 42px;
  margin-bottom: 20px;
`;

const Message = styled.p`
  color: ${props => props.theme.palette.text.primary};
  font-size: 18px;
  margin-bottom: 30px;
`;

const NotFound = () => {
  const theme = useTheme();
  
  return (
    <Container>
      <Title theme={theme}>404 - Trang không tồn tại</Title>
      <Message theme={theme}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </Message>
      <Button 
        as={Link} 
        to="/"
        theme={theme}
      >
        Quay về trang chủ
      </Button>
    </Container>
  );
};

export default NotFound;