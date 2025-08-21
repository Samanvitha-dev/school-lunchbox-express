// User roles
export const USER_ROLES = {
  PARENT: 'parent',
  DELIVERY: 'delivery',
  SCHOOL: 'school',
  ADMIN: 'admin',
  CATERER: 'caterer'
} as const;

// Order statuses
export const ORDER_STATUS = {
  ORDERED: 'ordered',
  ACCEPTED: 'accepted',
  PICKED: 'picked',
  IN_PROGRESS: 'in-progress',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

// Order types
export const ORDER_TYPES = {
  HOME: 'home',
  CATERER: 'caterer'
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error',
  ORDER_UPDATE: 'order-update'
} as const;

// Menu categories
export const MENU_CATEGORIES = {
  LUNCHBOX: 'lunchbox',
  FRUIT_BOWL: 'fruit-bowl',
  SNACK: 'snack'
} as const;

// Delivery status
export const DELIVERY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline'
} as const;

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
} as const;

// App configuration
export const APP_CONFIG = {
  NAME: 'LunchBox Express',
  VERSION: '1.0.0',
  DESCRIPTION: 'Digital Dabbawala Service for School Children',
  SUPPORT_EMAIL: 'support@lunchboxexpress.com',
  SUPPORT_PHONE: '+91-9999999999'
} as const;

// Pricing
export const PRICING = {
  HOME_FOOD_COST: 80,
  DELIVERY_CHARGE: 15,
  LOYALTY_POINTS_RATE: 10, // 1 point per ₹10
  MAX_LOYALTY_DISCOUNT: 0.1 // 10% max discount
} as const;

// Time constants
export const TIME_CONSTANTS = {
  DEFAULT_DELIVERY_TIME: 25, // minutes
  ORDER_CUTOFF_TIME: '10:00', // 10 AM
  DELIVERY_WINDOW_START: '12:00',
  DELIVERY_WINDOW_END: '14:00'
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  PHONE: /^\+?[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  VEHICLE_NUMBER: /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/
} as const;

// Default coordinates (Bangalore)
export const DEFAULT_COORDINATES = {
  LATITUDE: 12.9716,
  LONGITUDE: 77.5946
} as const;

// Week days
export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

// UPI providers
export const UPI_PROVIDERS = [
  { name: 'PhonePe', icon: '📱' },
  { name: 'Google Pay', icon: '💳' },
  { name: 'Paytm', icon: '💰' },
  { name: 'BHIM UPI', icon: '🏛️' }
] as const;