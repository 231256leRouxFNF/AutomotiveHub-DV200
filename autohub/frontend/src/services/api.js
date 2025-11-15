import axios from 'axios';
import { trackUserAction } from '../services/analytics';

// Use environment variable for API URL (supports both local and production)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ...existing code...

// Create axios instance with backend URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============ 1. AUTH SERVICE ============
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials); // Changed from '/api/login'
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Track login
      trackUserAction('login', {
        userId: response.data.user.id,
        username: response.data.user.username
      });
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Track registration
      trackUserAction('sign_up', {
        userId: response.data.user.id,
        username: response.data.user.username
      });
    }
    return response.data;
  },

  logout: () => {
    trackUserAction('logout'); // Track logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return Boolean(token && user);
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

// ============ 2. GARAGE SERVICE ============
export const garageService = {
  getUserVehicles: async (userId) => {
    try {
      // Try user-specific endpoint first
      const response = await api.get(`/api/vehicles/user/${userId}`);
      return response.data.vehicles || response.data || [];
    } catch (error) {
      // Fallback to getting all vehicles and filtering client-side
      try {
        const response = await api.get('/api/vehicles');
        let allVehicles = [];
        if (Array.isArray(response.data)) {
          allVehicles = response.data;
        } else if (response.data.vehicles) {
          allVehicles = response.data.vehicles;
        } else if (response.data.data) {
          allVehicles = response.data.data;
        }
        // Filter by user_id on client side
        const userVehicles = allVehicles.filter(v => v.user_id == userId);
        return userVehicles;
      } catch (fallbackError) {
        return [];
      }
    }
  },

  uploadVehicleImage: async (formData) => {
    const response = await api.post('/api/vehicles/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  addVehicle: async (vehicleData) => {
    const response = await api.post('/api/vehicles', vehicleData);
    
    // Track vehicle addition
    trackUserAction('add_vehicle', {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year
    });
    
    return response.data;
  },

  updateVehicle: async (vehicleId, vehicleData) => {
    const response = await api.put(`/api/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/api/vehicles/${vehicleId}`);
    
    // Track vehicle deletion
    trackUserAction('delete_vehicle', {
      vehicleId: vehicleId
    });
    
    return response.data;
  }
};

// ============ 3. EVENT SERVICE ============
export const eventService = {
  getAllEvents: async () => {
    const response = await api.get('/api/events');
    return response.data.events || [];
  },

  createEvent: async (eventData) => {
    const response = await api.post('/api/events', eventData);
    
    // Track event creation
    trackUserAction('create_event', {
      eventName: eventData.name,
      eventDate: eventData.date
    });
    
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/api/events/${eventId}`);
    return response.data;
  },

  // Add this new function for admin
  updateEventStatus: async (eventId, status) => {
    const response = await api.patch(`/api/events/${eventId}/status`, { status });
    return response.data;
  }
};

// ============ 4. SOCIAL SERVICE ============
export const socialService = {
  getPosts: async () => {
    try {
      // Change this from /api/social/posts to /api/posts
      const response = await api.get('/api/posts');
      return response.data.posts || [];
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return [];
    }
  },

  createPost: async (postData) => {
    try {
      
      const response = await api.post('/api/posts', postData);
      
      trackUserAction('create_post', {
        hasImage: !!postData.image_url
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  likePost: async (postId) => {
    // Keep this as is - it matches your server.js
    const response = await api.post(`/api/social/posts/${postId}/like`);
    
    trackUserAction('like_post', {
      postId: postId
    });
    
    return response.data;
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/api/social/posts/${postId}`);
      
      trackUserAction('delete_post', {
        postId: postId
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      throw error;
    }
  },

  addComment: async (postId, content) => {
    const response = await api.post(`/api/social/posts/${postId}/comments`, { content });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/api/social/posts/${postId}`);
    return response.data;
  }
};

// ============ 5. USER SERVICE ============
export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/api/user/profile');
      return response.data.user || null;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/user/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadAvatar: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', imageFile);
      
      const response = await api.post('/api/user/avatar', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/api/user/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }
};

// ============ 6. LISTING SERVICE (MARKETPLACE) ============
export const listingService = {
  getAllListings: async () => {
    try {
      const response = await api.get('/api/listings');
      return response.data.listings || [];
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      return [];
    }
  },

  getListingById: async (listingId) => {
    try {
      const response = await api.get(`/api/listings/${listingId}`);
      return response.data.listing || null;
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      throw error;
    }
  },

  createListing: async (listingData) => {
    try {
      const response = await api.post('/api/listings', listingData);
      
      // Track listing creation
      trackUserAction('create_listing', {
        make: listingData.make,
        model: listingData.model,
        price: listingData.price
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create listing:', error);
      throw error;
    }
  },

  updateListing: async (listingId, listingData) => {
    try {
      const response = await api.put(`/api/listings/${listingId}`, listingData);
      return response.data;
    } catch (error) {
      console.error('Failed to update listing:', error);
      throw error;
    }
  },

  deleteListing: async (listingId) => {
    try {
      const response = await api.delete(`/api/listings/${listingId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserListings: async (userId) => {
    try {
      const response = await api.get(`/api/listings/user/${userId}`);
      return response.data.listings || [];
    } catch (error) {
      console.error('Failed to fetch user listings:', error);
      return [];
    }
  },

  searchListings: async (searchParams) => {
    try {
      const response = await api.get('/api/listings/search', { params: searchParams });
      return response.data.listings || [];
    } catch (error) {
      console.error('Failed to search listings:', error);
      return [];
    }
  }
};

// ============ 6. ADMIN SERVICE ============
export const adminService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data.users || [];
    } catch (error) {
      return [];
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  getAllPosts: async () => {
    try {
      const response = await api.get('/api/admin/posts');
      return response.data.posts || [];
    } catch (error) {
      console.error('Failed to fetch all posts:', error);
      return [];
    }
  }
  ,
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/api/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete post:', error);
      throw error;
    }
  }
};

export const loginUser = authService.login; // Points to the correct function

export default api;
