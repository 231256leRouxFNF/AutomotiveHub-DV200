import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH SERVICES ============
export const authService = {
  login: async (identifier, password) => {
    try {
      const response = await api.post('/api/login', { identifier, password });
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

// ============ USER SERVICES ============
export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  getUserProfile: async (userId) => {
    const response = await api.get(`/api/users/${userId}/profile`);
    return response.data;
  },

  getUserFollows: async (userId, type = 'following') => {
    const response = await api.get(`/api/users/${userId}/follows?type=${type}`);
    return response.data;
  }
};

// ============ VEHICLE SERVICES ============
export const vehicleService = {
  getAllVehicles: async () => {
    const response = await api.get('/api/vehicles');
    return response.data;
  },

  getVehicleById: async (vehicleId) => {
    const response = await api.get(`/api/vehicles/${vehicleId}`);
    return response.data;
  },

  getFeaturedVehicles: async () => {
    const response = await api.get('/api/vehicles?featured=true');
    return response.data;
  }
};

// ============ SOCIAL SERVICES ============
export const socialService = {
  getAllPosts: async () => {
    const response = await api.get('/api/social/posts');
    return response.data;
  },

  getPostComments: async (postId) => {
    const response = await api.get(`/api/posts/${postId}/comments`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/api/social/posts', postData);
    return response.data;
  },

  createComment: async (postId, content) => {
    const response = await api.post(`/api/posts/${postId}/comments`, { content });
    return response.data;
  },

  toggleReaction: async (postId, reactionType) => {
    const response = await api.post(`/api/posts/${postId}/reactions`, { type: reactionType });
    return response.data;
  }
};

// ============ GENERAL SERVICES ============
export const generalService = {
  testConnection: async () => {
    try {
      const response = await api.get('/test-db');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getApiStatus: async () => {
    const response = await api.get('/');
    return response.data;
  }
};

// Export default api instance for custom requests
export default api;