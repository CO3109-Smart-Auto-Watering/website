import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useThemeContext } from '../../context/ThemeContext';

const Container = styled.div`
  display: flex;
  width: 900px;
  max-width: 100%;
  height: 550px;
  background-color: ${props => props.theme.palette.background.paper};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${props => props.theme.palette.mode === 'dark' 
    ? '0 0 20px rgba(0, 0, 0, 0.5)' 
    : '0 0 10px rgba(0, 0, 0, 0.1)'};
  margin: 50px auto;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    flex-direction: column-reverse;
  }
`;

const FormContainer = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  color: ${props => props.theme.palette.text.primary};
  
  /* Điều chỉnh màu scrollbar cho chế độ tối */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.05)'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
    border-radius: 3px;
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
  
  /* Overlay tối hơn cho chế độ tối */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.palette.mode === 'dark'
      ? 'rgba(0, 0, 0, 0.3)'
      : 'rgba(0, 0, 0, 0)'};
    transition: background 0.3s ease;
  }
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

// Nút chuyển đổi theme
const ThemeToggleButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: ${props => props.theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.theme.palette.text.primary};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s;
  
  &:hover {
    background: ${props => props.theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.1)'};
  }
  
  svg {
    font-size: 18px;
  }
`;

const AuthLayout = ({ children, image }) => {
  const theme = useTheme();
  const { toggleTheme } = useThemeContext();
  
  return (
    <Container theme={theme}>
      <ThemeToggleButton onClick={toggleTheme} theme={theme}>
        {theme.palette.mode === 'dark' ? <FaSun /> : <FaMoon />}
      </ThemeToggleButton>
      <FormContainer theme={theme}>
        {children}
      </FormContainer>
      <ImageContainer image={image} theme={theme} />
    </Container>
  );
};

export default AuthLayout;