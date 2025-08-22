import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Plus, 
  ShoppingCart, 
  Clock, 
  MapPin, 
  Bell, 
  Star,
  Trash2,
  Edit,
  Package,
  CreditCard,
  Gift,
  History
} from 'lucide-react';
import userService from '../services/userService';
import orderService from '../services/orderService';
import notificationService from '../services/notificationService';

interface Child {
  id: string;
  name: string;
  school: string;
  class: string;
  age: number;
  allergies: string[];
  preferences: string[];
}

interface Order {
  id: string;
  childName: string;
  school: string;
  items: string[];
  amount: number;
  status: 'pending' | 'accepted' | 'picked' | 'in-progress' | 'delivered';
  orderDate: string;
  deliveryTime: string;
  deliveryPerson?: string;
  qrCode: string;
  tracking_id?: string;
  nutrCalories?: number;
  nutrProtein?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'lunchbox' | 'fruit';
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  items: string[];
  price: number;
  image: string;
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  allergens: string[];
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [children, setChildren] = useState<Child[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0); // Will be loaded from user data
  const [showAddChild, setShowAddChild] = useState(false);
  const [orderMode, setOrderMode] = useState<'home' | 'caterer'>('home');
  const [newChild, setNewChild] = useState({
    name: '',
    schoolName: '', // Changed from 'school' to match database schema
    class: '',
    age: '',
    allergies: '',
    preferences: ''
  });
  const [confirmedDates, setConfirmedDates] = useState<string[]>([]);
  const [nutritionTotals, setNutritionTotals] = useState<{ calories: number; protein: number }>({ calories: 0, protein: 0 });

  // Mock menu items for caterer mode
  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Healthy Veggie Box',
      description: 'Nutritious vegetarian meal with seasonal vegetables',
      items: ['Rice', 'Dal', 'Mixed Vegetables', 'Roti', 'Pickle'],
      price: 80,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      nutrition: { calories: 450, protein: '15g', carbs: '65g', fat: '12g' },
      allergens: ['Gluten']
    },
    {
      id: '2',
      name: 'Protein Power Box',
      description: 'High-protein meal with chicken and legumes',
      items: ['Rice', 'Chicken Curry', 'Rajma', 'Roti', 'Salad'],
      price: 95,
      image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?auto=compress&cs=tinysrgb&w=300',
      nutrition: { calories: 520, protein: '25g', carbs: '55g', fat: '18g' },
      allergens: ['Gluten']
    },
    {
      id: '3',
      name: 'South Indian Special',
      description: 'Traditional South Indian flavors',
      items: ['Sambar Rice', 'Rasam', 'Poriyal', 'Papad', 'Curd'],
      price: 75,
      image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=300',
      nutrition: { calories: 400, protein: '12g', carbs: '70g', fat: '10g' },
      allergens: ['Dairy']
    }
  ];

  const fruitBowls = [
    { id: 'f1', name: 'Seasonal Fruit Mix', price: 30, image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 'f2', name: 'Apple & Banana', price: 25, image: 'https://images.pexels.com/photos/235294/pexels-photo-235294.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 'f3', name: 'Citrus Delight', price: 35, image: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  useEffect(() => {
    // Load initial data
    loadUserProfile();
    loadChildren();
    loadOrders();
    loadNotifications();
    loadConfirmed();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Extract loyalty points from user context or fetch from API
      if (user?.loyaltyPoints !== undefined) {
        setLoyaltyPoints(user.loyaltyPoints);
      } else if (user?.loyalty_points !== undefined) {
        setLoyaltyPoints(user.loyalty_points);
      } else {
        // Fallback: fetch from API if not in user context
        const profile = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('lunchbox_token')}`
          }
        });
        if (profile.ok) {
          const data = await profile.json();
          setLoyaltyPoints(data.user?.loyalty_points || 0);
        }
      }
    } catch (e) {
      console.error('Error loading user profile:', e);
      setLoyaltyPoints(0);
    }
  };

  const loadConfirmed = async () => {
    try {
      const { dates } = await orderService.getConfirmedDates();
      setConfirmedDates(dates || []);
    } catch {}
  };

  const loadChildren = async () => {
    try {
      const { children: apiChildren } = await userService.getChildren();
      const mapped: Child[] = (apiChildren || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        school: c.school_name,
        class: c.class,
        age: c.age,
        allergies: c.allergies || [],
        preferences: c.preferences || []
      }));
      setChildren(mapped);
    } catch (e) {
      // fallback to empty
      setChildren([]);
    }
  };

  const loadOrders = async () => {
    try {
      const { orders: apiOrders } = await orderService.getOrders();
      const mapped: Order[] = (apiOrders || []).map((o: any) => ({
        id: o.id,
        childName: o.child_name,
        school: o.school_name,
        items: (o.items || []).map((it: any) => it.menuItem?.name).filter(Boolean),
        amount: Number(o.amount || 0),
        status: o.status,
        orderDate: o.order_date,
        deliveryTime: o.delivery_time,
        deliveryPerson: o.delivery_person_name,
        qrCode: o.qr_code,
        tracking_id: o.tracking_id,
        nutrCalories: (o.items || []).reduce((sum: number, it: any) => sum + (Number(it.menuItem?.calories || 0) * Number(it.quantity || 1)), 0),
        nutrProtein: (o.items || []).reduce((sum: number, it: any) => sum + (Number(it.menuItem?.protein_grams || 0) * Number(it.quantity || 1)), 0)
      }));
      setOrders(mapped);
      // aggregate nutrition across orders (e.g., current month)
      const totals = mapped.reduce((acc, o) => ({
        calories: acc.calories + (o.nutrCalories || 0),
        protein: acc.protein + (o.nutrProtein || 0)
      }), { calories: 0, protein: 0 });
      setNutritionTotals(totals);
    } catch (e) {
      setOrders([]);
      setNutritionTotals({ calories: 0, protein: 0 });
    }
  };

  const loadNotifications = async () => {
    try {
      const { notifications: apiNotifications } = await notificationService.getNotifications();
      const mapped = (apiNotifications || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        time: n.created_at,
        read: n.is_read,
        type: n.type
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    } catch (e) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleAddChild = async () => {
    if (newChild.name && newChild.schoolName && newChild.class) {
      try {
        await userService.addChild({
          name: newChild.name,
          schoolName: newChild.schoolName,
          class: newChild.class,
          age: parseInt(newChild.age) || 8,
          allergies: newChild.allergies,
          preferences: newChild.preferences
        });
        await loadChildren();
        setNewChild({ name: '', schoolName: '', class: '', age: '', allergies: '', preferences: '' });
        setShowAddChild(false);
      } catch (e) {
        console.error('Error adding child:', e);
      }
    }
  };

  const addToCart = (item: MenuItem | any, type: 'lunchbox' | 'fruit') => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        type
      }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    const itemsTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 15;
    return itemsTotal + deliveryFee;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || children.length === 0) return;
    
    try {
      // Use first child for demo - in real app, user should select
      const selectedChild = children[0];
      
      const orderData = {
        childId: selectedChild.id,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryTime: '12:00 PM',
        specialNotes: '',
        isRecurring: false,
        recurringDays: [],
        orderType: orderMode,
        items: orderMode === 'caterer' ? cart.map(item => ({
          menuItem: {
            id: item.id,
            name: item.name,
            price: item.price,
            catererId: 'caterer-1' // Default caterer ID
          },
          quantity: item.quantity,
          specialInstructions: ''
        })) : [],
        loyaltyPointsUsed: 0
      };
      
      await orderService.createOrder(orderData);
      setCart([]); // Clear cart after successful order
      await loadOrders(); // Refresh orders
      
      // Show success notification
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'picked': return 'text-purple-600 bg-purple-100';
      case 'in-progress': return 'text-orange-600 bg-orange-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <Package className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Children</p>
              <p className="text-2xl font-bold">{children.length}</p>
            </div>
            <User className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Loyalty Points</p>
              <p className="text-2xl font-bold">{loyaltyPoints}</p>
            </div>
            <Gift className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Active Orders</p>
              <p className="text-2xl font-bold">{orders.filter(o => o.status !== 'delivered').length}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Track Orders - Undelivered with route visual */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Track Orders</h3>
        <div className="space-y-3">
          {orders.filter(o => o.status !== 'delivered').map((o) => (
            <div key={o.id} className="border rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{o.childName}</div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(o.status)}`}>{o.status}</span>
              </div>
              {/* Simple route visualization */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-red-500" />
                <div className="flex-1">
                  <svg viewBox="0 0 100 6" className="w-full h-2">
                    <line x1="0" y1="3" x2="100" y2="3" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="mt-1 text-xs text-gray-500">Route: Home → School</div>
            </div>
          ))}
          {orders.filter(o => o.status !== 'delivered').length === 0 && (
            <div className="text-sm text-gray-500">No active deliveries.</div>
          )}
        </div>
      </div>

      {/* Nutrition Analytics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Nutrition Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-xs text-blue-600">Total Calories</div>
            <div className="text-xl font-bold text-blue-700">{nutritionTotals.calories}</div>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <div className="text-xs text-green-600">Total Protein (g)</div>
            <div className="text-xl font-bold text-green-700">{nutritionTotals.protein}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <History className="w-5 h-5 mr-2 text-gray-600" />
          Recent Orders
        </h3>
        <div className="space-y-3">
          {orders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{order.childName}</p>
                <p className="text-sm text-gray-600">{order.school}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{order.amount}</p>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChildren = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">My Children</h3>
        <button
          onClick={() => setShowAddChild(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Child
        </button>
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((child) => (
          <div key={child.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-lg">{child.name}</h4>
                <p className="text-gray-600">{child.school}</p>
                <p className="text-sm text-gray-500">{child.class} • Age {child.age}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            {child.allergies.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-red-600">Allergies:</p>
                <p className="text-sm text-red-500">{child.allergies.join(', ')}</p>
              </div>
            )}
            
            {child.preferences.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-600">Preferences:</p>
                <p className="text-sm text-green-500">{child.preferences.join(', ')}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Child</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Child's Name"
                value={newChild.name}
                onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="School Name"
                value={newChild.schoolName}
                onChange={(e) => setNewChild({...newChild, schoolName: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="Class"
                value={newChild.class}
                onChange={(e) => setNewChild({...newChild, class: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="number"
                placeholder="Age"
                value={newChild.age}
                onChange={(e) => setNewChild({...newChild, age: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="Allergies (comma separated)"
                value={newChild.allergies}
                onChange={(e) => setNewChild({...newChild, allergies: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="Preferences (comma separated)"
                value={newChild.preferences}
                onChange={(e) => setNewChild({...newChild, preferences: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddChild}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Child
              </button>
              <button
                onClick={() => setShowAddChild(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBooking = () => (
    <div className="space-y-6">
      {/* Order Mode Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Choose Order Type</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setOrderMode('home')}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              orderMode === 'home' 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold">Home Delivery</h4>
              <p className="text-sm text-gray-600">Traditional dabbawala service</p>
            </div>
          </button>
          <button
            onClick={() => setOrderMode('caterer')}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              orderMode === 'caterer' 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold">Caterer Menu</h4>
              <p className="text-sm text-gray-600">Order from our partners</p>
            </div>
          </button>
        </div>
      </div>

      {orderMode === 'caterer' && (
        <>
          {/* Menu Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Lunch Boxes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      <p>Items: {item.items.join(', ')}</p>
                      <p>Calories: {item.nutrition.calories} | Protein: {item.nutrition.protein}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">₹{item.price}</span>
                      <button
                        onClick={() => addToCart(item, 'lunchbox')}
                        className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fruit Bowls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Fruit Bowls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fruitBowls.map((fruit) => (
                <div key={fruit.id} className="border rounded-lg overflow-hidden">
                  <img src={fruit.image} alt={fruit.name} className="w-full h-24 object-cover" />
                  <div className="p-3">
                    <h4 className="font-medium">{fruit.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold">₹{fruit.price}</span>
                      <button
                        onClick={() => addToCart(fruit, 'fruit')}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shopping Cart */}
          {cart.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shopping Cart ({cart.length} items)
              </h3>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold w-16 text-right">₹{item.price * item.quantity}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal:</span>
                  <span>₹{cart.reduce((total, item) => total + (item.price * item.quantity), 0)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Delivery Fee:</span>
                  <span>₹15</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
                
                <button 
                  onClick={handlePlaceOrder}
                  disabled={children.length === 0}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {children.length === 0 ? 'Add a child first' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Order History</h3>

      {/* Year Calendar with confirmed dates */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-medium mb-2">Yearly Calendar</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, m) => (
            <div key={m} className="border rounded p-2">
              <div className="text-sm font-semibold mb-1">{new Date(2000, m, 1).toLocaleString('en-IN', { month: 'long' })}</div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {Array.from({ length: 31 }).map((__, d) => {
                  const day = (d + 1).toString().padStart(2, '0');
                  const month = (m + 1).toString().padStart(2, '0');
                  const iso = `${new Date().getFullYear()}-${month}-${day}`;
                  const confirmed = confirmedDates.includes(iso);
                  return (
                    <div key={d} className={`h-6 flex items-center justify-center rounded ${confirmed ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                      {d + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold">{order.childName}</h4>
                <p className="text-gray-600">{order.school}</p>
                <p className="text-sm text-gray-500">Order #{order.qrCode}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">₹{order.amount}</p>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Items:</p>
                <p>{order.items.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date:</p>
                <p>{order.orderDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Delivery Time:</p>
                <p>{order.deliveryTime}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.username}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">{loyaltyPoints} points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'children', label: 'My Children', icon: User },
              { id: 'booking', label: 'New Booking', icon: Plus },
              { id: 'orders', label: 'Order History', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'children' && renderChildren()}
        {activeTab === 'booking' && renderBooking()}
        {activeTab === 'orders' && renderOrders()}
      </div>
    </div>
  );
}