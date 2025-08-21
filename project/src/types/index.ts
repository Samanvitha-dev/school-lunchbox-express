export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  userType: 'parent' | 'delivery' | 'school' | 'admin' | 'caterer';
  createdAt: string;
  isFirstLogin?: boolean;
  loyaltyPoints?: number;
}

export interface Parent extends User {
  houseNo: string;
  locationName: string;
  cityName: string;
  latitude: number;
  longitude: number;
  noOfChildren: number;
  address: string;
  children: Child[];
  loyaltyPoints: number;
}

export interface Child {
  id: string;
  name: string;
  parentId: string;
  schoolName: string;
  schoolId: string;
  class: string;
  allergies: string[];
  preferences: string[];
  age: number;
}

export interface DeliveryStaff extends User {
  name: string;
  activeSince: string;
  isActive: boolean;
  currentStatus: 'available' | 'busy' | 'offline';
  address: string;
  latitude: number;
  longitude: number;
  serviceArea: string[];
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
}

export interface School extends User {
  schoolName: string;
  schoolId: string;
  address: string;
  latitude: number;
  longitude: number;
  classes: string[];
  contactPerson: string;
  establishedYear: number;
}

export interface Caterer extends User {
  businessName: string;
  address: string;
  contactPerson: string;
  latitude: number;
  longitude: number;
  rating: number;
  isActive: boolean;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  catererId: string;
  name: string;
  description: string;
  items: string[];
  nutritionalInfo: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  price: number;
  category: 'lunchbox' | 'fruit-bowl' | 'snack';
  isAvailable: boolean;
  imageUrl?: string;
  allergens: string[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface LunchboxOrder {
  id: string;
  parentId: string;
  childId: string;
  childName: string;
  schoolId: string;
  schoolName: string;
  pickupAddress: string;
  deliveryAddress: string;
  orderDate: string;
  deliveryTime: string;
  status: 'ordered' | 'accepted' | 'picked' | 'in-progress' | 'delivered' | 'cancelled';
  specialNotes: string;
  isRecurring: boolean;
  recurringDays: string[];
  deliveryStaffId?: string;
  pickupTime?: string;
  actualDeliveryTime?: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  qrCode: string;
  estimatedTime: number;
  orderType: 'home' | 'caterer';
  items: CartItem[];
  catererId?: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsUsed?: number;
}

export interface Location {
  houseNo: string;
  address: string;
  latitude: number;
  longitude: number;
  landmark: string;
  city: string;
  pincode: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'order-update';
  timestamp: string;
  isRead: boolean;
  orderId?: string;
  actionRequired?: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  provider: string;
  status: 'pending' | 'success' | 'failed';
  transactionId: string;
  timestamp: string;
  loyaltyPointsUsed?: number;
}

export interface Route {
  id: string;
  deliveryStaffId: string;
  date: string;
  pickups: RouteStop[];
  deliveries: RouteStop[];
  totalDistance: number;
  estimatedDuration: number;
  actualDuration?: number;
  status: 'planned' | 'in-progress' | 'completed';
}

export interface RouteStop {
  orderId: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'pickup' | 'delivery';
  estimatedTime: string;
  actualTime?: string;
  status: 'pending' | 'completed';
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Feedback {
  id: string;
  userId: string;
  orderId?: string;
  catererId?: string;
  rating: number;
  comment: string;
  timestamp: string;
  type: 'order' | 'caterer' | 'delivery' | 'general';
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  completed: boolean;
}