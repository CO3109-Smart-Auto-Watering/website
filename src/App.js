import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <CssBaseline />
        <Router basename="/website">
          <AppRoutes />
        </Router>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;