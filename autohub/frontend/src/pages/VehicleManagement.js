import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SEO from '../components/SEO'; // ADD THIS
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import VehicleCard from '../components/VehicleCard';
import api from '../services/api';
import { garageService } from '../services/api';
import { authService } from '../services/api';
import { trackUserAction } from '../services/analytics';
import './VehicleManagement.css';

const VehicleManagement = () => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    description: '',
    imageUrl: ''
  });
  
  const [garageStats, setGarageStats] = useState({
    totalVehicles: 0,
    featured: 0,
    upcomingEvents: 0
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Get current user on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      const user = authService.getCurrentUser();
      console.log('👤 Current user:', user);
      
      if (!user || !user.id) {
        console.log('❌ No user found, redirecting to login');
        window.location.href = '/login';
        return;
      }

      setCurrentUser(user);

      try {
        setIsLoading(true);
        console.log('📥 Fetching vehicles for user:', user.id);
        
        const userVehicles = await garageService.getUserVehicles(user.id);
        console.log('✅ Vehicles response:', userVehicles);
        console.log('✅ Is array?', Array.isArray(userVehicles));
        
        const vehiclesArray = Array.isArray(userVehicles) ? userVehicles : [];
        console.log('🚗 Final vehicles array:', vehiclesArray);
        
        setVehicles(vehiclesArray);

        setGarageStats({
          totalVehicles: vehiclesArray.length,
          featured: 0,
          upcomingEvents: 0
        });

      } catch (error) {
        console.error('❌ Error loading garage data:', error);
        console.error('❌ Error response:', error.response?.data);
        setGarageStats({ totalVehicles: 0, featured: 0, upcomingEvents: 0 });
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []); // Remove user, navigate from dependencies
  
  const loadGarageData = async (userId) => {
    try {
      console.log('📥 Loading garage data for user:', userId);

      // Call the API
      const userVehicles = await garageService.getUserVehicles(userId);
      
      console.log('🚗 Vehicles from API:', userVehicles);
      
      // userVehicles should already be an array from the updated service
      const vehiclesArray = Array.isArray(userVehicles) ? userVehicles : [];
      
      console.log('✅ Setting vehicles:', vehiclesArray);
      setVehicles(vehiclesArray);

      // Update stats
      setGarageStats({
        totalVehicles: vehiclesArray.length,
        featured: 0,
        upcomingEvents: 0
      });

    } catch (error) {
      console.error('❌ Error loading garage data:', error);
      setGarageStats({ totalVehicles: 0, featured: 0, upcomingEvents: 0 });
      setVehicles([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
      } else {
        alert('Please drop an image file.');
      }
    }
  };
  
  const handleFileClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
      }
    };
    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('You must be logged in to add a vehicle.');
      return;
    }

    setIsLoading(true);

    try {
      const form = new FormData();
      // DON'T send user_id - the backend gets it from JWT token
      form.append('make', formData.make);
      form.append('model', formData.model);
      form.append('year', formData.year);
      form.append('color', formData.color);
      form.append('description', formData.description);
      
      if (imageFile) {
        form.append('images', imageFile);
      }

      console.log(' Submitting vehicle:', { make: formData.make, model: formData.model });

      const { data: result } = await api.post('/api/garage/vehicles', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log(' Response:', result);

      if (result && result.success) {
        alert('Vehicle added successfully!');
        setFormData({
          make: '',
          model: '',
          year: '',
          color: '',
          description: '',
          imageUrl: ''
        });
        setImageFile(null);
        loadGarageData(currentUser.id);
      } else {
        alert(result.message || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('❌ Error adding vehicle:', error);
      alert(`Failed to add vehicle: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditVehicle = (vehicle) => {
    // For now, just populate the form with vehicle data
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      color: vehicle.color,
      description: vehicle.description || '',
      imageUrl: vehicle.image_url || vehicle.primary_image || ''
    });
  };
  
  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm(`Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) {
      try {
        const result = await garageService.deleteVehicle(vehicle.id);
        trackUserAction.deleteVehicle(); // Track delete vehicle
        if (result.success) {
          alert('Vehicle deleted successfully!');
          loadGarageData(currentUser.id);
        } else {
          alert(result.message || 'Failed to delete vehicle');
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  // When rendering vehicle images
  const getImageUrl = (vehicle) => {
    // If vehicle has image_url from Cloudinary, use it directly
    if (vehicle.image_url && vehicle.image_url.startsWith('http')) {
      return vehicle.image_url;
    }
    
    // If vehicle has images JSON field
    if (vehicle.images) {
      try {
        const images = typeof vehicle.images === 'string' ? JSON.parse(vehicle.images) : vehicle.images;
        if (Array.isArray(images) && images.length > 0) {
          return images[0].url || images[0];
        }
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    }
    
    // Fallback to placeholder
    return '/images/placeholder-car.jpg';
  };

  if (isLoading) {
    return <div className="garage-loading">Loading your garage...</div>;
  }

  if (error) {
    return <div className="garage-error">{error}</div>;
  }

  return (
    <>
      <SEO 
        title="My Garage - Vehicle Management"
        description="Manage your vehicle collection, track maintenance, and showcase your rides in your personal garage."
        keywords="garage management, vehicle collection, car portfolio, my vehicles"
        url="https://automotivehub-dv200.vercel.app/garage"
      />
      <div className="vehicle-management">
        <Header />

        {/* Main Content */}
        <main className="garage-main">
          <h1 className="garage-title">My Garage</h1>

          {/* Stats Cards */}
          <div className="stats-container">
            <StatCard
              icon={
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.37012 16C1.37012 15.3103 1.4841 14.6251 1.70782 13.9726L1.76885 13.8257L3.63008 9.96826L3.68723 9.86305L3.91453 9.52276C4.4962 8.73652 5.44352 8.02002 6.69012 8.02002L16.0001 8.02002C17.1656 8.02002 18.1402 8.46057 18.9082 9.00453L19.2251 9.24222L19.3342 9.34092C19.9462 9.95288 20.6884 10.728 21.2721 11.345C21.5648 11.6546 21.8199 11.9271 22.002 12.1217C22.0051 12.125 22.0081 12.1289 22.0111 12.1321C22.0726 12.146 22.1402 12.1621 22.2137 12.1789C22.5904 12.2647 23.1177 12.386 23.7204 12.5283C24.9214 12.8118 26.4381 13.1822 27.661 13.5218C29.2574 13.9371 30.6301 15.4889 30.6301 17.33V21.32C30.6301 22.0212 30.3899 22.7084 29.8741 23.224C29.3585 23.7398 28.6713 23.98 27.9701 23.98H25.3101C24.5756 23.98 23.9801 23.3846 23.9801 22.65C23.9801 21.9155 24.5756 21.32 25.3101 21.32H27.9701V17.33C27.9701 16.8571 27.6108 16.3636 27.174 16.1611L26.983 16.0935C26.9718 16.0907 26.9603 16.0875 26.9492 16.0845C25.7781 15.7592 24.3017 15.3985 23.1086 15.1168C22.5145 14.9766 21.994 14.856 21.6227 14.7714C21.4374 14.7291 21.2893 14.6954 21.1877 14.6727C21.1367 14.6612 21.0971 14.6526 21.0707 14.6466C21.0577 14.6437 21.0475 14.6416 21.0408 14.6401C21.0382 14.6396 21.0359 14.6392 21.0344 14.6389H21.0318C20.8343 14.595 20.6499 14.5064 20.4927 14.3817L20.346 14.2454H20.3447V14.244C20.3439 14.2432 20.3424 14.2418 20.3408 14.2402C20.3376 14.2367 20.3329 14.2314 20.3265 14.2245C20.3138 14.2109 20.295 14.191 20.2706 14.1648C20.2215 14.1121 20.15 14.0347 20.0602 13.9388C19.8808 13.7469 19.6282 13.4791 19.3393 13.1738C18.7769 12.5791 18.0818 11.8518 17.5067 11.2749C17.0059 10.8873 16.5108 10.68 16.0001 10.68L6.69012 10.68C6.52471 10.68 6.24225 10.7995 5.99394 11.1905L4.20546 14.8947C4.08993 15.2518 4.03012 15.6246 4.03012 16L4.03012 21.32H6.69012C7.42465 21.32 8.02012 21.9155 8.02012 22.65C8.02012 23.3846 7.42465 23.98 6.69012 23.98H4.03012C3.32887 23.98 2.64178 23.7398 2.12604 23.224C1.61029 22.7084 1.37012 22.0212 1.37012 21.32L1.37012 16Z" fill="#636AE8"/>
                  <path d="M10.6598 22.6699C10.6598 21.9354 10.0644 21.3399 9.32984 21.3399C8.59531 21.3399 7.99984 21.9354 7.99984 22.6699C7.99984 23.4045 8.59531 23.9999 9.32984 23.9999C10.0644 23.9999 10.6598 23.4045 10.6598 22.6699ZM13.3198 22.6699C13.3198 24.8736 11.5335 26.6599 9.32984 26.6599C7.12623 26.6599 5.33984 24.8736 5.33984 22.6699C5.33984 20.4663 7.12623 18.6799 9.32984 18.6799C11.5335 18.6799 13.3198 20.4663 13.3198 22.6699Z" fill="#636AE8"/>
                  <path d="M19.9897 21.3401C20.7242 21.3401 21.3197 21.9355 21.3197 22.6701C21.3197 23.4046 20.7242 24.0001 19.9897 24.0001L12.0097 24.0001C11.2752 24.0001 10.6797 23.4046 10.6797 22.6701C10.6797 21.9355 11.2752 21.3401 12.0097 21.3401L19.9897 21.3401Z" fill="#636AE8"/>
                  <path d="M23.9997 22.6699C23.9997 21.9354 23.4042 21.3399 22.6697 21.3399C21.9351 21.3399 21.3397 21.9354 21.3397 22.6699C21.3397 23.4045 21.9351 23.9999 22.6697 23.9999C23.4042 23.9999 23.9997 23.4045 23.9997 22.6699ZM26.6597 22.6699C26.6597 24.8736 24.8734 26.6599 22.6697 26.6599C20.466 26.6599 18.6797 24.8736 18.6797 22.6699C18.6797 20.4663 20.466 18.6799 22.6697 18.6799C24.8734 18.6799 26.6597 20.4663 26.6597 22.6699Z" fill="#636AE8"/>
                </svg>
              }
              number={String(garageStats.totalVehicles ?? 0)}
              label="Total Vehicles"
            />

            <StatCard
              icon={
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1631 1.37612C16.4867 1.40255 16.7986 1.50823 17.0723 1.68265L17.2061 1.77487L17.332 1.87877C17.5738 2.09535 17.7584 2.36797 17.8711 2.67235L17.9218 2.82691L17.9295 2.85289L20.0323 11.0134H20.031C20.0905 11.2434 20.2112 11.4533 20.3791 11.6213C20.547 11.7892 20.757 11.9087 20.987 11.9681L29.1462 14.0709L29.1682 14.0773C29.5365 14.1789 29.8664 14.3835 30.1204 14.6657L30.2256 14.7917L30.3191 14.9255C30.5234 15.2452 30.6334 15.6179 30.6334 15.9996C30.6334 16.4362 30.49 16.8614 30.2256 17.2088C29.9942 17.5127 29.6807 17.7432 29.3241 17.8738L29.1682 17.9231C29.1611 17.9251 29.1535 17.9265 29.1462 17.9283L20.987 20.0312C20.7569 20.0905 20.5472 20.2113 20.3791 20.3793C20.2113 20.5471 20.0905 20.7562 20.031 20.9859L20.0323 20.9871L17.9283 29.1464L17.9204 29.1723C17.8031 29.5916 17.5516 29.9612 17.2048 30.2244C16.8579 30.4875 16.4348 30.6309 15.9995 30.6309C15.5642 30.6309 15.141 30.4874 14.7941 30.2244C14.4908 29.9942 14.2593 29.6833 14.1278 29.3282L14.0785 29.1723C14.0761 29.1636 14.073 29.1551 14.0707 29.1464L11.9679 20.9871C11.9085 20.7571 11.789 20.5472 11.6211 20.3793C11.4949 20.2532 11.345 20.1537 11.1808 20.0871L11.0133 20.0312L2.85402 17.9271L2.82286 17.9193C2.40524 17.8008 2.03774 17.5486 1.776 17.2023C1.54697 16.8993 1.40923 16.5383 1.37856 16.162L1.37207 15.9996L1.37856 15.8373C1.40934 15.461 1.5471 15.0998 1.776 14.797L1.87861 14.6722C2.13002 14.3904 2.45738 14.185 2.82286 14.0813L2.85273 14.0721L11.0133 11.9668L11.1808 11.9109C11.3449 11.8443 11.495 11.746 11.6211 11.62C11.7888 11.4524 11.9083 11.2429 11.9679 11.0134L14.0721 2.85289L14.0798 2.82691C14.1971 2.4077 14.4486 2.03797 14.7955 1.77487L14.9279 1.68265C15.2475 1.47885 15.6195 1.36963 16.0007 1.36963L16.1631 1.37612ZM14.5434 11.6771C14.3651 12.367 14.0058 12.9983 13.5018 13.502C13.0607 13.9427 12.5226 14.2722 11.9328 14.467L11.677 14.5423L6.02966 15.9984L11.677 17.4556L11.9328 17.5309C12.523 17.726 13.0606 18.0573 13.5018 18.4986C14.0057 19.0026 14.3653 19.6321 14.5434 20.3221L14.5448 20.3234L15.9982 25.9694L17.4555 20.3234V20.3221L17.5307 20.0663C17.7258 19.4765 18.0574 18.9397 18.4984 18.4986C19.0026 17.9944 19.6328 17.6337 20.3232 17.4556L25.9718 15.9996L20.3232 14.5436C19.6329 14.3655 19.0025 14.006 18.4984 13.502C18.0571 13.0608 17.7258 12.5231 17.5307 11.933L17.4555 11.6771L15.9995 6.02853L14.5434 11.6771Z" fill="#636AE8"/>
                  <path d="M25.3398 9.32993V4.00993C25.3398 3.2754 25.9353 2.67993 26.6698 2.67993C27.4044 2.67993 27.9998 3.2754 27.9998 4.00993V9.32993C27.9998 10.0645 27.4044 10.6599 26.6698 10.6599C25.9353 10.6599 25.3398 10.0645 25.3398 9.32993Z" fill="#636AE8"/>
                  <path d="M29.3297 5.33984C30.0642 5.33984 30.6597 5.93531 30.6597 6.66984C30.6597 7.40438 30.0642 7.99984 29.3297 7.99984L24.0097 7.99984C23.2751 7.99984 22.6797 7.40438 22.6797 6.66984C22.6797 5.93531 23.2751 5.33984 24.0097 5.33984L29.3297 5.33984Z" fill="#636AE8"/>
                  <path d="M4 25.3298L4 22.6698C4 21.9353 4.59547 21.3398 5.33 21.3398C6.06453 21.3398 6.66 21.9353 6.66 22.6698L6.66 25.3298C6.66 26.0644 6.06453 26.6598 5.33 26.6598C4.59547 26.6598 4 26.0644 4 25.3298Z" fill="#636AE8"/>
                  <path d="M6.65992 22.6699C7.39445 22.6699 7.98992 23.2654 7.98992 23.9999C7.98992 24.7345 7.39445 25.3299 6.65992 25.3299H3.99992C3.26539 25.3299 2.66992 24.7345 2.66992 23.9999C2.66992 23.2654 3.26539 22.6699 3.99992 22.6699H6.65992Z" fill="#636AE8"/>
                </svg>
              }
              number={String(garageStats.featured ?? 0)}
              label="Featured"
            />

            <StatCard
              icon={
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.33984 7.99009L9.33984 2.67009C9.33984 1.93556 9.93531 1.34009 10.6698 1.34009C11.4044 1.34009 11.9998 1.93556 11.9998 2.67009L11.9998 7.99009C11.9998 8.72462 11.4044 9.32009 10.6698 9.32009C9.93531 9.32009 9.33984 8.72462 9.33984 7.99009Z" fill="#636AE8"/>
                  <path d="M20 7.99009V2.67009C20 1.93556 20.5954 1.34009 21.33 1.34009C22.0646 1.34009 22.66 1.93556 22.66 2.67009V7.99009C22.66 8.72462 22.0646 9.32009 21.33 9.32009C20.5954 9.32009 20 8.72462 20 7.99009Z" fill="#636AE8"/>
                  <path d="M26.6402 8.02003C26.6402 7.2855 26.0448 6.69003 25.3102 6.69003L6.6902 6.69003C5.95566 6.69003 5.3602 7.2855 5.3602 8.02003L5.3602 26.64C5.3602 27.3746 5.95566 27.97 6.6902 27.97L25.3102 27.97C26.0448 27.97 26.6402 27.3746 26.6402 26.64L26.6402 8.02003ZM29.3002 26.64C29.3002 28.8437 27.5139 30.63 25.3102 30.63L6.6902 30.63C4.48658 30.63 2.7002 28.8437 2.7002 26.64L2.7002 8.02003C2.7002 5.81642 4.48658 4.03003 6.6902 4.03003L25.3102 4.03003C27.5139 4.03003 29.3002 5.81642 29.3002 8.02003L29.3002 26.64Z" fill="#636AE8"/>
                  <path d="M27.9702 12C28.7048 12 29.3002 12.5955 29.3002 13.33C29.3002 14.0646 28.7048 14.66 27.9702 14.66L4.0302 14.66C3.29566 14.66 2.7002 14.0646 2.7002 13.33C2.7002 12.5955 3.29566 12 4.0302 12L27.9702 12Z" fill="#636AE8"/>
                </svg>
              }
              number={String(garageStats.upcomingEvents ?? 0)}
              label="Upcoming Events"
            />
          </div>

          {/* Content Grid */}
          <div className="content-grid">
            {/* Add New Vehicle Form */}
            <div className="add-vehicle-card">
              <h2 className="add-vehicle-title">Add New Vehicle</h2>
              <p className="add-vehicle-description">
                Showcase your ride by adding a new car profile to your garage. Include stunning images and detailed descriptions.
              </p>

              <form onSubmit={handleSubmit} className="vehicle-form">
                {/* Upload Area */}
                <div 
                  className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileClick}
                >
                  {formData.imageUrl ? (
                    <div className="image-preview">
                      <img src={formData.imageUrl} alt="Vehicle Preview" className="preview-image" />
                      <p className="upload-text preview-caption">Click or drag to change image</p>
                    </div>
                  ) : (
                    <>
                      <svg className="upload-icon" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 42L22 26C22 24.8954 22.8954 24 24 24C25.1046 24 26 24.8954 26 26L26 42C26 43.1046 25.1046 44 24 44C22.8954 44 22 43.1046 22 42Z" fill="#8C8D8B"/>
                        <path d="M16.7396 4.05619C19.1598 3.86425 21.5931 4.22559 23.8529 5.11283C26.1125 6.00011 28.1415 7.39019 29.7845 9.17729C31.0845 10.5914 32.1113 12.2269 32.8295 13.9995L34.9995 13.9995L35.4409 14.0093C37.6451 14.0975 39.7767 14.8455 41.5541 16.1636C43.4495 17.5692 44.8415 19.5481 45.5267 21.8062C46.2119 24.0648 46.1521 26.4844 45.3569 28.7066C44.5615 30.9286 43.0733 32.837 41.1107 34.148L40.9349 34.2516C40.0395 34.7266 38.9125 34.4562 38.3373 33.5952C37.7237 32.6768 37.9715 31.4354 38.8901 30.8218L39.3431 30.4898C40.3679 29.6794 41.1485 28.596 41.5913 27.359C42.0973 25.945 42.1365 24.4054 41.7005 22.9682C41.2647 21.531 40.3777 20.2712 39.1713 19.3765C38.1159 18.5939 36.8641 18.1276 35.5619 18.023L34.9995 17.9995H31.4193C30.5355 17.9992 29.7563 17.4188 29.5033 16.5718C28.9825 14.8274 28.0713 13.2246 26.8393 11.8843C25.6069 10.5439 24.0849 9.50093 22.3901 8.83549C20.6953 8.17023 18.871 7.89859 17.056 8.04253C15.241 8.18655 13.4821 8.74137 11.9134 9.66557C10.3446 10.5898 9.007 11.8605 8.00134 13.3785C6.99594 14.8962 6.34816 16.6226 6.10876 18.4273C5.86934 20.2324 6.04528 22.0688 6.62048 23.7964C7.19568 25.5238 8.15554 27.0988 9.42906 28.4C10.2014 29.1894 10.189 30.4556 9.39976 31.228C8.6105 32.0006 7.3443 31.9858 6.57164 31.1968L5.95446 30.5288C4.56114 28.9334 3.49466 27.0756 2.8236 25.06C2.05668 22.7566 1.82474 20.3086 2.1439 17.9019C2.4631 15.4954 3.32664 13.1933 4.66734 11.1695C6.00824 9.14555 7.79238 7.45263 9.88414 6.22027C11.9756 4.98813 14.3198 4.24823 16.7396 4.05619Z" fill="#8C8D8B"/>
                        <path d="M22.7381 24.4492C23.5237 23.8086 24.6817 23.8538 25.4139 24.586L33.4139 32.5859L33.5507 32.7383C34.1913 33.5238 34.1461 34.6818 33.4139 35.414C32.6817 36.1464 31.5237 36.1916 30.7381 35.5508L30.5859 35.414L23.9999 28.8281L17.4139 35.414C16.6329 36.1952 15.3668 36.1952 14.5858 35.414C13.8047 34.633 13.8047 33.3669 14.5858 32.5859L22.5859 24.586L22.7381 24.4492Z" fill="#8C8D8B"/>
                      </svg>
                      <p className="upload-text">Drag & drop your vehicle image here, or click to browse</p>
                    </>
                  )}
                </div>

                {/* Form Fields */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="make" className="form-label">Make</label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      placeholder="e.g., Toyota"
                      value={formData.make}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="model" className="form-label">Model</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      placeholder="e.g., Supra"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="year" className="form-label">Year</label>
                    <input
                      type="text"
                      id="year"
                      name="year"
                      placeholder="e.g., 1998"
                      value={formData.year}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="color" className="form-label">Color</label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      placeholder="e.g., Red"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Tell us about your vehicle..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="4"
                    required
                  />
                </div>

                <button type="submit" className="save-vehicle-btn" disabled={isLoading}>
                  {isLoading ? (
                    <div>Adding Vehicle...</div>
                  ) : (
                    <>
                      <svg className="plus-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.6896 7.33002C13.0597 7.33002 13.3596 7.62998 13.3596 8.00002C13.3596 8.37006 13.0597 8.67002 12.6896 8.67002L3.30965 8.67002C2.93962 8.67002 2.63965 8.37006 2.63965 8.00002C2.63965 7.62998 2.93962 7.33002 3.30965 7.33002L12.6896 7.33002Z" fill="white"/>
                        <path d="M7.33008 12.69L7.33008 3.31001C7.33008 2.93999 7.63004 2.64001 8.00008 2.64001C8.37012 2.64001 8.67008 2.93999 8.67008 3.31001L8.67008 12.69C8.67008 13.0601 8.37012 13.36 8.00008 13.36C7.63004 13.36 7.33008 13.0601 7.33008 12.69Z" fill="white"/>
                      </svg>
                      Save New Vehicle
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Vehicle Grid */}
            <div className="vehicles-grid">
              {vehicles.length > 0 ? (
                vehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onEdit={handleEditVehicle}
                    onDelete={handleDeleteVehicle}
                  />
                ))
              ) : (
                <div className="vehicles-placeholder">
                  <p>No vehicles in your garage yet. Add your first vehicle using the form!</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VehicleManagement;
