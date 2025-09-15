import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VehicleManagement from './pages/VehicleManagement';
import CommunityFeed from './pages/CommunityFeed';
import ListingDetails from './pages/ListingDetails';
import Marketplace from './pages/Marketplace';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegisterPage />} />
        <Route path="/garage" element={<VehicleManagement />} />
        <Route path="/vehicle-management" element={<VehicleManagement />} />
        <Route path="/community" element={<CommunityFeed />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/listing-details" element={<ListingDetails />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<NotificationsCenter />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/sell/create" element={<CreateListingWizard />} />
        <Route path="/sell/listings" element={<MyListings />} />
        <Route path="/sell/dashboard" element={<SellerDashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
