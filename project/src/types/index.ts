export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  userType: 'parent' | 'delivery' | 'school' | 'admin' | 'caterer';
  doorNo?: string; // Maps to door_no in database
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  isFirstLogin?: boolean;
  loyaltyPoints?: number;
}

export interface Parent extends User {
  houseNo: string; // Maps to house_no in database
  locationName: string; // Maps to location_name in database
  cityName: string; // Maps to city_name in database
  latitude: number;
  longitude: number;
  noOfChildren: number; // Maps to no_of_children in database
  address: string;
  children: Child[];
  loyaltyPoints: number; // Maps to loyalty_points in database
}

export interface Child {
  id: string;
  name: string;
  parentId: string; // Maps to parent_id in database
  schoolName: string; // Maps to school_name in database
  schoolId: string; // Maps to school_id in database
  class: string;
  allergies: string[]; // Database stores as TEXT[] array
  preferences: string[]; // Database stores as TEXT[] array
  age: number;
}

export interface DeliveryStaff extends User {
  name: string;
  activeSince: string;
  isActive: boolean;
  currentStatus: 'available' | 'busy' | 'offline'; // Maps to current_status in database
  address: string;
  latitude: number;
  longitude: number;
  serviceArea: string[]; // Maps to service_area TEXT[] in database
  vehicleType: string; // Maps to vehicle_type in database
  vehicleNumber: string; // Maps to vehicle_number in database
  rating: number;
  totalDeliveries: number; // Maps to total_deliveries in database
  totalEarnings?: number; // Maps to total_earnings in database
}

export interface School extends User {
  schoolName: string; // Maps to school_name in database
  schoolId: string; // Maps to school_id in database
  address: string;
  latitude: number;
  longitude: number;
  classes: string[]; // Database stores as TEXT[] array
  contactPerson: string; // Maps to contact_person in database
  establishedYear: number; // Maps to established_year in database
  locationName?: string; // Maps to location_name in database
}

export interface Caterer extends User {
  businessName: string; // Maps to business_name in database
  address: string;
  contactPerson: string; // Maps to contact_person in database
  latitude: number;
  longitude: number;
  rating: number;
  isActive: boolean;
  menuItems: MenuItem[];
  locationName?: string; // Maps to location_name in database
}

export interface MenuItem {
  id: string;
  catererId: string; // Maps to caterer_id in database
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
  category: 'lunchbox' | 'fruit_bowl' | 'other'; // Updated to match database enum
  isAvailable: boolean; // Maps to is_available in database
  imageUrl?: string; // Maps to image_url in database
  allergens: string[]; // Database stores as TEXT[] array
  proteinGrams?: number; // Maps to protein_grams in database
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string; // Maps to special_instructions in database
}

export interface LunchboxOrder {
  id: string;
  parentId: string; // Maps to parent_id in database
  childId: string; // Maps to child_id in database
  childName: string; // Maps to child_name in database
  schoolId: string; // Maps to school_id in database
  schoolName: string; // Maps to school_name in database
  pickupAddress: string; // Maps to pickup_address in database
  deliveryAddress: string; // Maps to delivery_address in database
  pickupDoorNo?: string; // Maps to pickup_door_no in database
  deliveryDoorNo?: string; // Maps to delivery_door_no in database
  orderDate: string; // Maps to order_date in database
  deliveryTime: string; // Maps to delivery_time in database
  status: 'ordered' | 'accepted' | 'picked' | 'in-progress' | 'delivered' | 'cancelled';
  specialNotes: string; // Maps to special_notes in database
  isRecurring: boolean; // Maps to is_recurring in database
  recurringDays: string[]; // Maps to recurring_days TEXT[] in database
  deliveryStaffId?: string; // Maps to delivery_staff_id in database
  pickupTime?: string; // Maps to pickup_time in database
  actualDeliveryTime?: string; // Maps to actual_delivery_time in database
  amount: number;
  deliveryCharge?: number; // Maps to delivery_charge in database
  distanceKm?: number; // Maps to distance_km in database
  paymentStatus: 'pending' | 'paid' | 'failed';
  qrCode: string; // Maps to qr_code in database
  trackingId?: string; // Maps to tracking_id in database
  estimatedTime: number; // Maps to estimated_time in database
  orderType: 'home' | 'caterer'; // Maps to order_type in database
  items: CartItem[];
  catererId?: string; // Maps to caterer_id in database
  loyaltyPointsEarned?: number; // Maps to loyalty_points_earned in database
  loyaltyPointsUsed?: number; // Maps to loyalty_points_used in database
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