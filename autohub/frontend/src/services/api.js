import axios from 'axios';

// Base API configuration
const API_BASE_URL = (() => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    return 'http://localhost:5000';
  }
  return 'https://www.automotivehub.digital';
})();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to handle auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL || ''}${config.url}`
    });
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
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
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        
        // Set default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return response.data;
      }
      
      throw new Error('Login failed: Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error.message;
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await api.post('/api/register', { username, email, password });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        
        // Set default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return response.data;
      }
      
      throw new Error('Registration failed: Invalid response from server');
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || error.message;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getToken: () => {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      localStorage.removeItem('currentUser'); // Clear corrupted data
      return null;
    }
  },

  isAuthenticated: () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('currentUser');
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
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
  getUserVehicles: async (userId) => {
    const response = await api.get(`/api/garage/${userId}`);
    console.log('🔍 API Response:', response.data); // Add this debug line
    
    // The backend returns { success: true, vehicles: [...] }
    return response.data.vehicles || []; // Return the vehicles array directly
  },

  getGarageStats: async (userId) => {
    const response = await api.get(`/api/garage/stats/${userId}`);
    return response.data || {};
  },

  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/api/garage/${vehicleId}`);
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
