import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { authService } from './services/api';
import { initGA, logPageView } from './services/analytics';

// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CommunityFeed from './pages/CommunityFeed';
import Marketplace from './pages/Marketplace';
import VehicleManagement from './pages/VehicleManagement';
import ListingDetails from './pages/ListingDetails';
import EditListingWizard from './pages/EditListingWizard';
import NotificationsCenter from './pages/NotificationsCenter';
import SearchResults from './pages/SearchResults';
import EditProfilePage from './pages/EditProfilePage';
import AdminPanel from './pages/AdminPanel';

// Analytics wrapper component
const AnalyticsWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

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
  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <AnalyticsWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CommunityFeed />} /> {/* CHANGED: CommunityFeed as landing page */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <CommunityFeed />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/marketplace" 
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/garage" 
              element={
                <ProtectedRoute>
                  <VehicleManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationsCenter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <SearchResults />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/edit" 
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Other routes */}
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/edit-listing/:id" element={<EditListingWizard />} />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnalyticsWrapper>
      </Router>
    </HelmetProvider>
  );
}

export default App;
