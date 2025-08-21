import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useOrders';
import orderService from '../services/orderService';
import notificationService from '../services/notificationService';
import { MapPin, Clock, User, Package, Route, CheckCircle, XCircle, Phone, Navigation } from 'lucide-react';

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, fetchOrders } = useOrders();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data on component mount
  React.useEffect(() => {
    loadPendingOrders();
    loadAcceptedOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      const response = await orderService.getPendingOrders();
      setPendingOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to load pending orders:', error);
    }
  };

  const loadAcceptedOrders = async () => {
    try {
      await fetchOrders();
      setAcceptedOrders(orders.filter((order: any) => order.delivery_staff_id === user?.id));
    } catch (error) {
      console.error('Failed to load accepted orders:', error);
    }
  };

  const allOrders = [...acceptedOrders];
  const todayOrders = allOrders.filter(order => 
    new Date(order.order_date).toDateString() === new Date().toDateString()
  );

  const pickedOrders = todayOrders.filter(order => order.status === 'picked');
  const inTransitOrders = todayOrders.filter(order => order.status === 'in-progress');
  const completedOrders = todayOrders.filter(order => order.status === 'delivered');

  const handleAcceptOrder = async (orderId: string) => {
    setLoading(true);
    try {
      await orderService.acceptOrder(orderId);
      await loadPendingOrders();
      await loadAcceptedOrders();
      alert('Order accepted successfully!');
    } catch (error) {
      console.error('Failed to accept order:', error);
      alert('Failed to accept order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, status);
      await loadAcceptedOrders();
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked': return 'bg-orange-100 text-orange-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Hello, {user?.name || user?.username}!</h2>
        <p className="text-green-100">Ready for today's deliveries</p>
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{pendingOrders.length}</p>
            <p className="text-green-100 text-sm">Available</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{pickedOrders.length}</p>
            <p className="text-green-100 text-sm">Picked Up</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{inTransitOrders.length}</p>
            <p className="text-green-100 text-sm">In Transit</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{completedOrders.length}</p>
            <p className="text-green-100 text-sm">Delivered</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Today's Orders</h3>
              <p className="text-2xl font-bold text-blue-600">{todayOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Completion Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {todayOrders.length > 0 ? Math.round((completedOrders.length / todayOrders.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Route className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Active Status</h3>
              <p className={`text-sm font-medium ${
                user?.current_status === 'available' ? 'text-green-600' :
                user?.current_status === 'busy' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {user?.current_status?.toUpperCase() || 'AVAILABLE'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Available Orders</h3>
          <div className="text-sm text-gray-600">
            {pendingOrders.length} orders available
          </div>
        </div>

        {pendingOrders.length > 0 ? (
          <div className="space-y-4">
            {pendingOrders.map((order: any) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{order.child_name}</span>
                      <span className="text-sm text-gray-500">#{order.qr_code}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span><strong>Pickup:</strong> {order.pickup_address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span><strong>Delivery:</strong> {order.delivery_address}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>By {order.delivery_time}</span>
                      </div>
                      <span>₹{order.amount}</span>
                      <span>{order.distance_km?.toFixed(1)}km</span>
                      <span className="text-green-600 font-medium">Earn: ₹{order.delivery_charge}</span>
                    </div>
                    {order.special_notes && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Special Notes:</strong> {order.special_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {loading ? 'Accepting...' : 'Accept Order'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No orders available at the moment</p>
          </div>
        )}
      </div>

      {/* Today's Deliveries */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">My Accepted Orders</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {todayOrders.length > 0 ? (
          <div className="space-y-4">
            {todayOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{order.child_name}</span>
                      <span className="text-sm text-gray-500">#{order.qr_code}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span><strong>Pickup:</strong> {order.pickup_address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span><strong>Delivery:</strong> {order.delivery_address}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>By {order.delivery_time}</span>
                      </div>
                      <span>₹{order.amount}</span>
                      <span>{order.estimated_time} min</span>
                      <span>{order.distance_km?.toFixed(1)}km</span>
                    </div>
                    {order.special_notes && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Special Notes:</strong> {order.special_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                    </span>
                    
                    {/* Demo Action Buttons */}
                    <div className="space-y-1">
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'picked')}
                          className="block w-full text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Mark Picked Up
                        </button>
                      )}
                      {order.status === 'picked' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'in-progress')}
                          className="block w-full text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Start Delivery
                        </button>
                      )}
                      {order.status === 'in-progress' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="block w-full text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                          disabled={loading}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Route Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm">
                      <Navigation className="w-4 h-4" />
                      <span>Navigate</span>
                    </button>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>Call Parent</span>
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Distance: {order.distance_km?.toFixed(1)}km • Earnings: ₹{order.delivery_charge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No deliveries scheduled for today</p>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{user?.rating || 5.0}</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{user?.total_deliveries || 0}</p>
            <p className="text-sm text-gray-600">Total Deliveries</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{completedOrders.length}</p>
            <p className="text-sm text-gray-600">Today Completed</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">₹{user?.total_earnings || 0}</p>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">All Orders</h3>
      <div className="space-y-4">
        {allOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">{order.child_name}</span>
                  <span className="text-sm text-gray-500">#{order.qr_code}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-800">Date</p>
                    <p>{new Date(order.order_date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Time</p>
                    <p>{order.delivery_time}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Amount</p>
                    <p>₹{order.amount}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Delivery Address</p>
                    <p className="truncate">{order.delivery_address}</p>
                  </div>
                </div>
                {order.special_notes && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Special Notes:</strong> {order.special_notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                </span>
                {order.actual_delivery_time && (
                  <p className="text-xs text-green-600 mt-1">
                    Delivered at {new Date(order.actual_delivery_time).toLocaleTimeString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Orders
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
      </div>
    </div>
  );
};

export default DeliveryDashboard;