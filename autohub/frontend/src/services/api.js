import axios from 'axios';

// Create axios instance with backend URL
const api = axios.create({
  baseURL: 'https://automotivehub-dv200-1.onrender.com', // ✅ BACKEND URL
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

export default api;
