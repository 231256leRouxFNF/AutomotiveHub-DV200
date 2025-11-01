import axios from 'axios';

// Create axios instance with backend URL
const api = axios.create({
  baseURL: 'https://automotivehub-dv200-1.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
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

// Auth Service - ESSENTIAL
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

// User Service - ESSENTIAL
export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data.user || null;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
  }
};

// Garage Service - ESSENTIAL
export const garageService = {
  getUserVehicles: async (userId) => {
    const response = await api.get(`/api/garage/${userId}`);
    return response.data.vehicles || [];
  },

  deleteVehicle: async (vehicleId) => {
    const response = await api.delete(`/api/garage/${vehicleId}`);
    return response.data;
  }
};

// Listing Service - ESSENTIAL (Marketplace)
export const listingService = {
  getAllListings: async () => {
    const response = await api.get('/api/listings');
    return response.data.listings || [];
  },

  getListing: async (id) => {
    const response = await api.get(`/api/listings/${id}`);
    return response.data.listing || null;
  },

  createListing: async (listingData) => {
    const response = await api.post('/api/listings', listingData);
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/api/listings/${id}`);
    return response.data;
  },

  searchListings: async (query) => {
    const response = await api.get('/api/search', { params: query });
    return response.data.listings || [];
  }
};

// Event Service - SIMPLE (Community)
export const eventService = {
  getAllEvents: async () => {
    const response = await api.get('/api/events');
    return response.data.events || [];
  }
};

// Notification Service - SIMPLE (just count)
export const notificationService = {
  getUnreadCount: async (userId) => {
    try {
      const response = await api.get(`/api/notifications/unread-count?userId=${userId}`);
      return response.data.count || 0;
    } catch (error) {
      return 0; // Return 0 if endpoint doesn't exist yet
    }
  }
};

// Social Service - SIMPLE (just posts)
export const socialService = {
  getPosts: async () => {
    try {
      const response = await api.get('/api/social/posts');
      return response.data.posts || [];
    } catch (error) {
      return []; // Return empty array if endpoint doesn't exist yet
    }
  }
};

// General Service - SIMPLE (dashboard stats, etc.)
export const generalService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data || {};
    } catch (error) {
      return {
        totalVehicles: 0,
        totalListings: 0,
        totalEvents: 0,
        activeUsers: 0
      };
    }
  }
};

export default api;
