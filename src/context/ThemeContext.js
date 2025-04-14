import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Create theme context
const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
  // Sử dụng localStorage để lưu chế độ theme
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });
  
  // Tạo theme dựa trên mode với màu xanh lá (green)
  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#2e7d32',  // Xanh lá đậm
        light: '#4caf50', // Xanh lá vừa
        dark: '#1b5e20',  // Xanh lá rất đậm
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#66bb6a', // Xanh lá nhạt hơn
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#ffffff'
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c'
      },
      // Giữ các màu khác nhưng điều chỉnh để phù hợp với theme xanh lá
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828'
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00'
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b'
      },
      // Các màu nền và text khác nhau cho light/dark mode
      ...(mode === 'light'
        ? {
            text: {
              primary: 'rgba(0, 0, 0, 0.87)',
              secondary: 'rgba(0, 0, 0, 0.6)',
              disabled: 'rgba(0, 0, 0, 0.38)'
            },
            background: {
              default: '#f8f8f8',
              paper: '#ffffff'
            }
          }
        : {
            text: {
              primary: '#ffffff',
              secondary: 'rgba(255, 255, 255, 0.7)',
              disabled: 'rgba(255, 255, 255, 0.5)'
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e'
            }
          })
    }
  }), [mode]);

  // Lưu theme mode vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    console.log('Theme mode changed to:', mode);
  }, [mode]);

  // Hàm toggle theme với logging để debug
  const toggleTheme = () => {
    console.log('Toggle theme called. Current mode:', mode);
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      console.log('Setting new mode to:', newMode);
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mode }}>
      <MuiThemeProvider theme={theme}>
        <StyledThemeProvider theme={theme}>
          {children}
        </StyledThemeProvider>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};