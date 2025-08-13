import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VehicleManagement from './pages/VehicleManagement';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegisterPage />} />
        <Route path="/garage" element={<VehicleManagement />} />
        <Route path="/vehicle-management" element={<VehicleManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
