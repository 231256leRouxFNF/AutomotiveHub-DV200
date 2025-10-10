import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VehicleManagement from './pages/VehicleManagement';
import CommunityFeed from './pages/CommunityFeed';
import ListingDetails from './pages/ListingDetails';
import Marketplace from './pages/Marketplace';
import UserProfile from './pages/UserProfile';
import Messages from './pages/Messages';
import NotificationsCenter from './pages/NotificationsCenter';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import CreateListingWizard from './pages/CreateListingWizard';
import MyListings from './pages/MyListings';
import SellerDashboard from './pages/SellerDashboard';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Compare from './pages/Compare';
import SearchResults from './pages/SearchResults';
import CategoryPage from './pages/CategoryPage';
import AdminDashboard from './pages/AdminDashboard';
import CreateEventWizard from './pages/CreateEventWizard'; // Import the new component
import MyEvents from './pages/MyEvents'; // Import the new MyEvents component
import AboutUs from './pages/AboutUs'; // Import the new AboutUs component
import { authService } from './services/api'; // Import authService

const AuthWrapper = ({ children }) => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegisterPage />} />
        <Route path="/about-us" element={<AboutUs />} /> {/* New route for About Us page */}
        {/* Default route for authenticated users or redirect to login */}
        <Route path="/" element={
          <AuthWrapper>
            <CommunityFeed />
          </AuthWrapper>
        } />
        <Route path="/community" element={
          <AuthWrapper>
            <CommunityFeed />
          </AuthWrapper>
        } />

        {/* Protected Routes (requires authentication) */}
        <Route path="/garage" element={<AuthWrapper><VehicleManagement /></AuthWrapper>} />
        <Route path="/vehicle-management" element={<AuthWrapper><VehicleManagement /></AuthWrapper>} />
        <Route path="/marketplace" element={<AuthWrapper><Marketplace /></AuthWrapper>} />
        <Route path="/listing/:id" element={<AuthWrapper><ListingDetails /></AuthWrapper>} />
        <Route path="/listing-details" element={<AuthWrapper><ListingDetails /></AuthWrapper>} />
        <Route path="/profile" element={<AuthWrapper><UserProfile /></AuthWrapper>} />
        <Route path="/messages" element={<AuthWrapper><Messages /></AuthWrapper>} />
        <Route path="/notifications" element={<AuthWrapper><NotificationsCenter /></AuthWrapper>} />
        <Route path="/settings" element={<AuthWrapper><Settings /></AuthWrapper>} />
        <Route path="/help" element={<AuthWrapper><HelpCenter /></AuthWrapper>} />
        <Route path="/terms" element={<AuthWrapper><Terms /></AuthWrapper>} />
        <Route path="/privacy" element={<AuthWrapper><Privacy /></AuthWrapper>} />
        <Route path="/sell/create" element={<AuthWrapper><CreateListingWizard /></AuthWrapper>} />
        <Route path="/sell/listings" element={<AuthWrapper><MyListings /></AuthWrapper>} />
        <Route path="/sell/events" element={<AuthWrapper><MyEvents /></AuthWrapper>} />
        <Route path="/sell/dashboard" element={<AuthWrapper><SellerDashboard /></AuthWrapper>} />
        <Route path="/orders" element={<AuthWrapper><Orders /></AuthWrapper>} />
        <Route path="/cart" element={<AuthWrapper><Cart /></AuthWrapper>} />
        <Route path="/favorites" element={<AuthWrapper><Favorites /></AuthWrapper>} />
        <Route path="/compare" element={<AuthWrapper><Compare /></AuthWrapper>} />
        <Route path="/search" element={<AuthWrapper><SearchResults /></AuthWrapper>} />
        <Route path="/category/:slug" element={<AuthWrapper><CategoryPage /></AuthWrapper>} />
        <Route path="/admin" element={<AuthWrapper><AdminDashboard /></AuthWrapper>} />
        <Route path="/create-event" element={<AuthWrapper><CreateEventWizard /></AuthWrapper>} />
        <Route path="/profile/:id" element={<AuthWrapper><UserProfile /></AuthWrapper>} />
        <Route path="/garage/:id" element={<AuthWrapper><VehicleManagement /></AuthWrapper>} />
      </Routes>
    </Router>
  );
}

export default App;
