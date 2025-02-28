import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;