import axios from 'axios';
import { trackUserAction } from '../services/analytics';

// Create axios instance with backend URL
const api = axios.create({
  baseURL: 'https://automotivehub-dv200-1.onrender.com',
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
    const response = await api.post('/api/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
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

// After successful login:
const handleLogin = async (credentials) => {
  const result = await authService.login(credentials);
  trackUserAction.login(); // Track login event
  // ...rest of code
};

// ============ 2. GARAGE SERVICE ============
export const garageService = {
  getUserVehicles: async (userId) => {
    try {
      const response = await api.get(`/api/garage/${userId}`);
      return response.data.vehicles || [];
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      return [];
    }
  },

  addVehicle: async (vehicleData) => {
    const response = await api.post('/api/garage', vehicleData);
    return response.data;
  },

  updateVehicle: async (vehicleId, vehicleData) => {
    const response = await api.put(`/api/garage/${vehicleId}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/api/garage/${vehicleId}`);
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
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/api/events/${eventId}`);
    return response.data;
  }
};

// ============ 4. SOCIAL SERVICE ============
export const socialService = {
  getPosts: async () => {
    try {
      const response = await api.get('/api/social/posts');
      return response.data.posts || [];
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return [];
    }
  },

  createPost: async (postData) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    
    if (postData.image) {
      formData.append('image', postData.image);
    }

    const response = await api.post('/api/social/posts', formData);
    return response.data;
  },

  likePost: async (postId) => {
    const response = await api.post(`/api/social/posts/${postId}/like`);
    return response.data;
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
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/user/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
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
      console.error('Failed to upload avatar:', error);
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
      console.error('Failed to delete listing:', error);
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

export default api;
