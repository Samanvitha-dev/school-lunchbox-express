import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lunchbox_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('lunchbox_token');
      localStorage.removeItem('lunchbox_user_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  profile: '/auth/profile',
  logout: '/auth/logout',
  
  // Users
  children: '/users/children',
  loyaltyPoints: '/users/loyalty-points',
  userStats: '/users/stats',
  
  // Orders
  orders: '/orders',
  todayOrders: '/orders/today',
  orderStatus: (id: string) => `/orders/${id}/status`,
  
  // Menu
  menu: '/menu',
  menuToggle: (id: string) => `/menu/${id}/toggle`,
  
  // Notifications
  notifications: '/notifications',
  markAsRead: (id: string) => `/notifications/${id}/read`,
  markAllAsRead: '/notifications/read-all',
  unreadCount: '/notifications/unread-count',
  
  // Health
  health: '/health',
};