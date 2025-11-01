import axios from 'axios';

// Create axios instance with backend URL
const api = axios.create({
  baseURL: 'https://automotivehub-dv200-1.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: async (userData) => {
    const response = await api.post('/api/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/login', credentials);
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
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Garage endpoints
export const garageService = {
  getUserVehicles: async (userId) => {
    const response = await api.get(`/api/garage/${userId}`);
    console.log('🔍 API Response:', response.data);
    return response.data.vehicles || [];
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

// Notification endpoints
export const notificationService = {
  getUnreadCount: async (userId) => {
    try {
      const response = await api.get(`/api/notifications/unread-count?userId=${userId}`);
      return response.data.count || 0;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  },

  getNotifications: async (userId) => {
    try {
      const response = await api.get(`/api/notifications?userId=${userId}`);
      return response.data.notifications || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false };
    }
  }
};

// Listing endpoints (Marketplace)
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

  getListing: async (id) => {
    try {
      const response = await api.get(`/api/listings/${id}`);
      return response.data.listing || null;
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      return null;
    }
  },

  createListing: async (listingData) => {
    const response = await api.post('/api/listings', listingData);
    return response.data;
  },

  updateListing: async (id, listingData) => {
    const response = await api.put(`/api/listings/${id}`, listingData);
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/api/listings/${id}`);
    return response.data;
  },

  searchListings: async (query) => {
    try {
      const response = await api.get('/api/search', { params: query });
      return response.data.listings || [];
    } catch (error) {
      console.error('Failed to search listings:', error);
      return [];
    }
  }
};

// Social/Community endpoints
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
    const response = await api.post('/api/social/posts', postData);
    return response.data;
  },

  likePost: async (postId) => {
    const response = await api.post(`/api/social/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId, comment) => {
    const response = await api.post(`/api/social/posts/${postId}/comments`, { content: comment });
    return response.data;
  }
};

// User/Profile endpoints
export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/api/user/profile');
      return response.data.user || null;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data.user || null;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }
};

// Event endpoints
export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get('/api/events');
      return response.data.events || [];
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  },

  getEvent: async (id) => {
    try {
      const response = await api.get(`/api/events/${id}`);
      return response.data.event || null;
    } catch (error) {
      console.error('Failed to fetch event:', error);
      return null;
    }
  }
};

export default api;
