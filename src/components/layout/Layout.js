import React from 'react';
import Sidebar from '../../features/sidebar/Sidebar';
import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components using MUI system
const LayoutContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  background: theme.palette.background.default, // Uses theme background color
  color: theme.palette.text.primary, // Uses theme text color
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  marginLeft: 260,
  padding: 32,
  overflowY: 'auto',
  background: theme.palette.background.default,
  transition: 'background-color 0.3s ease, color 0.3s ease',
  
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%',
  },
}));

const Layout = ({ children }) => {
  const theme = useTheme();

  return (
    <LayoutContainer>
      <Sidebar />
      <Content>
        {children}
      </Content>
    </LayoutContainer>
  );
};

export default Layout;