import React, { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { authService } from './services/api';
import ListingDetails from './pages/ListingDetails';

// Import pages - CLEANED UP
import CommunityFeed from './pages/CommunityFeed';
import Marketplace from './pages/Marketplace';
import VehicleManagement from './pages/VehicleManagement';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import ProductPage from './pages/ProductPage';
import UserProfile from './pages/UserProfile';

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
    <HelmetProvider>
      <Router>
        <AnalyticsWrapper>
          <Routes>
            <Route path="/" element={<CommunityFeed />} />
            <Route path="/community" element={<CommunityFeed />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/garage" element={
              <ProtectedRoute>
                <VehicleManagement />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
          </Routes>
        </AnalyticsWrapper>
        <Analytics />
      </Router>
    </HelmetProvider>
  );
}

export default App;
