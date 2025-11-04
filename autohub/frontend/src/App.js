import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { initGA, trackPageView } from './services/analytics';
import { authService } from './services/api';

// Import pages
import Home from './pages/Home';
import CommunityFeed from './pages/CommunityFeed';
import MarketplaceListings from './pages/MarketplaceListings';
import VehicleManagement from './pages/VehicleManagement';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
          <Route path="/marketplace" element={<MarketplaceListings />} />
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
