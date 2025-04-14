import React from 'react';
import styled from 'styled-components';
import { useTheme } from '@mui/material';

// More complete default theme fallback values
const defaultTheme = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#4791db'
    },
    secondary: {
      main: '#9c27b0',
      dark: '#7b1fa2',
      light: '#ba68c8'
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828'
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100'
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b'
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)'
    },
    background: {
      paper: '#fff',
      default: '#f5f5f5'
    },
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)'
    },
    divider: 'rgba(0, 0, 0, 0.12)'
  }
};

const StyledButton = styled.button`
  display: block;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  padding: 12px 24px;
  background-color: ${props => {
    const theme = props.theme || defaultTheme;
    return props.disabled 
      ? theme.palette?.action?.disabledBackground || 'rgba(0, 0, 0, 0.12)'
      : theme.palette?.primary?.main || '#1976d2';
  }};
  color: ${props => {
    const theme = props.theme || defaultTheme;
    return props.disabled 
      ? theme.palette?.action?.disabled || 'rgba(0, 0, 0, 0.26)' 
      : '#fff';
  }};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s, transform 0.1s;
  margin-top: ${props => props.marginTop || '0'};
  margin-bottom: ${props => props.marginBottom || '0'};
  text-align: center;
  
  &:hover {
    background-color: ${props => {
      const theme = props.theme || defaultTheme;
      return !props.disabled && (theme.palette?.primary?.dark || '#115293');
    }};
  }
  
  &:active {
    transform: ${props => !props.disabled && 'scale(0.98)'};
  }
`;

const Button = ({ children, ...props }) => {
  // Get theme from MUI's useTheme hook
  const muiTheme = useTheme() || defaultTheme;
  
  return (
    <StyledButton theme={muiTheme} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;