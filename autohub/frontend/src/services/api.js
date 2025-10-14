import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

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

  register: async (username, email, password) => {
    try {
      const response = await api.post('/api/register', { username, email, password });
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
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format: expected 3 parts separated by dots.');
        return null;
      }
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(tokenParts[1]));
      // Add the token to the payload for easier access if needed
      payload.token = token;
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
  },

  uploadProfileAvatar: async (userId, avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const response = await api.post(`/api/users/${userId}/profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
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

  updatePost: async (postId, updates) => {
    const response = await api.put(`/api/social/posts/${postId}`, updates);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/api/social/posts/${postId}`);
    return response.data;
  },

  createComment: async (postId, content) => {
    const response = await api.post(`/api/posts/${postId}/comments`, { content });
    return response.data;
  },

  toggleReaction: async (postId, reactionType) => {
    const response = await api.post(`/api/posts/${postId}/reactions`, { type: reactionType });
    return response.data;
  },

  toggleLike: async (postId) => {
    // Bridge to existing reactions endpoint
    return await socialService.toggleReaction(postId, 'like');
  },

  getPostsByUserId: async (userId) => {
    try {
      const response = await api.get(`/api/social/posts/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// ============ GARAGE SERVICES ============
export const garageService = {
  getGarageStats: async (userId) => {
    const response = await api.get(`/api/garage/stats/${userId}`);
    return response.data;
  },

  getUserVehicles: async (userId) => {
    const response = await api.get(`/api/garage/vehicles/${userId}`);
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    const response = await api.post('/api/garage/vehicles', vehicleData);
    return response.data;
  },

  updateVehicle: async (vehicleId, vehicleData) => {
    const response = await api.put(`/api/garage/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/api/garage/vehicles/${vehicleId}`);
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
  },

  searchAll: async (query, category, location) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      if (location) params.append('location', location);

      const response = await api.get(`/api/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ============ LISTING SERVICES ============
export const listingService = {
  createListing: async (listingData) => {
    try {
      const formData = new FormData();
      for (const key in listingData) {
        if (key === 'images') {
          listingData.images.forEach(image => formData.append('images', image));
        } else if (key === 'imageUrls') {
          // If imageUrls is an array, stringify it for FormData
          formData.append(key, JSON.stringify(listingData[key]));
        } else {
          formData.append(key, listingData[key]);
        }
      }
      const response = await api.post('/api/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getListingById: async (id) => {
    try {
      const response = await api.get(`/api/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateListing: async (id, listingData) => {
    try {
      const response = await api.put(`/api/listings/${id}`, listingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteListing: async (id) => {
    try {
      const response = await api.delete(`/api/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getListingsByUserId: async (userId) => {
    try {
      const response = await api.get(`/api/listings/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllListings: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api/listings?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ============ EVENT SERVICES ============
export const eventService = {
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllEvents: async () => {
    try {
      const response = await api.get('/api/events');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await api.get(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/api/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEventsByUserId: async (userId) => {
    try {
      const response = await api.get(`/api/events/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// ============ NOTIFICATION SERVICES ============
export const notificationService = {
  getNotifications: async (userId) => {
    try {
      const response = await api.get(`/api/notifications?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const response = await api.get(`/api/notifications/unread-count?userId=${userId}`);
      return response.data.count;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ============ FOLLOW SERVICES ============
export const followService = {
  followUser: async (followeeId) => {
    try {
      // Assuming followerId is handled by backend auth middleware (req.userId)
      const response = await api.post('/api/follows/follow', { followeeId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  unfollowUser: async (followeeId) => {
    try {
      const response = await api.post('/api/follows/unfollow', { followeeId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  isFollowing: async (followeeId) => {
    try {
      // Assuming followerId is handled by backend auth middleware (req.userId)
      const response = await api.get(`/api/follows/${followeeId}/status`);
      return response.data.isFollowing;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getFollowers: async (userId) => {
    try {
      const response = await api.get(`/api/follows/${userId}/followers`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getFollowing: async (userId) => {
    try {
      const response = await api.get(`/api/follows/${userId}/following`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Export default api instance for custom requests
export default api;
