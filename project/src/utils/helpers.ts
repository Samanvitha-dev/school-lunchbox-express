import { ORDER_STATUS, NOTIFICATION_TYPES } from './constants';

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time
export const formatTime = (time: string | Date): string => {
  return new Date(time).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date and time
export const formatDateTime = (dateTime: string | Date): string => {
  return new Date(dateTime).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case ORDER_STATUS.ORDERED:
      return 'bg-gray-100 text-gray-800';
    case ORDER_STATUS.ACCEPTED:
      return 'bg-blue-100 text-blue-800';
    case ORDER_STATUS.PICKED:
      return 'bg-yellow-100 text-yellow-800';
    case ORDER_STATUS.IN_PROGRESS:
      return 'bg-purple-100 text-purple-800';
    case ORDER_STATUS.DELIVERED:
      return 'bg-green-100 text-green-800';
    case ORDER_STATUS.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get notification color
export const getNotificationColor = (type: string): string => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return 'bg-green-400';
    case NOTIFICATION_TYPES.WARNING:
      return 'bg-yellow-400';
    case NOTIFICATION_TYPES.ERROR:
      return 'bg-red-400';
    case NOTIFICATION_TYPES.ORDER_UPDATE:
      return 'bg-blue-400';
    default:
      return 'bg-gray-400';
  }
};

// Calculate loyalty points
export const calculateLoyaltyPoints = (amount: number): number => {
  return Math.floor(amount / 10);
};

// Calculate loyalty discount
export const calculateLoyaltyDiscount = (points: number, maxAmount: number): number => {
  return Math.min(points, maxAmount * 0.1);
};

// Generate QR code
export const generateQRCode = (childName: string): string => {
  return `LB${Date.now()}-${childName.toUpperCase().replace(/\s+/g, '')}`;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

// Validate username
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

// Get time ago
export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random coordinates (for demo)
export const generateRandomCoordinates = (baseLatitude: number, baseLongitude: number) => {
  return {
    latitude: baseLatitude + (Math.random() - 0.5) * 0.1,
    longitude: baseLongitude + (Math.random() - 0.5) * 0.1
  };
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Estimate delivery time based on distance
export const estimateDeliveryTime = (distance: number): number => {
  // Base time + time based on distance (assuming 20 km/h average speed)
  const baseTime = 15; // minutes
  const travelTime = (distance / 20) * 60; // minutes
  return Math.round(baseTime + travelTime);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Local storage helpers
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};