import axios from 'axios';

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

// Auth Service
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

  // ADD THIS FUNCTION - Fix for the error
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return Boolean(token && user);
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

// Garage Service
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

// Event Service
export const eventService = {
  getAllEvents: async () => {
    const response = await api.get('/api/events');
    return response.data.events || [];
  },

  createEvent: async (eventData) => {
    const response = await api.post('/api/events', eventData);
    return response.data;
  }
};

// Social Service
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

// Notification Service
export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get('/api/notifications');
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
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }
};

export default api;
