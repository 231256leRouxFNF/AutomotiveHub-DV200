import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { authService } from './services/api';

// Import pages - CLEANED UP
import CommunityFeed from './pages/CommunityFeed';
import Marketplace from './pages/Marketplace';
import VehicleManagement from './pages/VehicleManagement';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';

// Simplified Analytics wrapper - removed GA tracking temporarily
const AnalyticsWrapper = ({ children }) => {
  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AnalyticsWrapper>
        <Routes>
          <Route path="/" element={<CommunityFeed />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/garage" element={
            <ProtectedRoute>
              <VehicleManagement />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </AnalyticsWrapper>
      <Analytics />
    </Router>
  );
}

export default App;
