import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { initGA, trackPageView } from './services/analytics';
import { authService } from './services/api';

// Import pages
import Home from './pages/Home';
import CommunityFeed from './pages/CommunityFeed'; // Changed from Community
import Marketplace from './pages/Marketplace';
import VehicleManagement from './pages/VehicleManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// Analytics wrapper component
const AnalyticsWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <Router>
      <AnalyticsWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/garage" element={
            <ProtectedRoute>
              <VehicleManagement />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
