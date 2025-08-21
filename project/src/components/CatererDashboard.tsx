import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Caterer, MenuItem, LunchboxOrder } from '../types';
import { getOrdersByCatererId, getMenuItemsByCatererId, addMenuItem, updateMenuItem, mockPolls, mockFeedback } from '../data/mockDatabase';
import { Plus, Edit3, Eye, EyeOff, Star, TrendingUp, Package, DollarSign, Users, BarChart3, MessageSquare } from 'lucide-react';

const CatererDashboard: React.FC = () => {
  const { userDetails } = useAuth();
  const caterer = userDetails as Caterer;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    items: '',
    price: '',
    category: 'lunchbox' as 'lunchbox' | 'fruit-bowl' | 'snack',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    allergens: '',
    imageUrl: ''
  });

  const orders = getOrdersByCatererId(caterer?.id || '');
  const menuItems = getMenuItemsByCatererId(caterer?.id || '');
  const todayOrders = orders.filter(order => 
    new Date(order.orderDate).toDateString() === new Date().toDateString()
  );

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.amount, 0);
  const averageRating = caterer?.rating || 0;
  const totalCustomers = new Set(orders.map(order => order.parentId)).size;

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;

    const menuItem: MenuItem = {
      id: `menu-${Date.now()}`,
      catererId: caterer.id,
      name: newItem.name,
      description: newItem.description,
      items: newItem.items.split(',').map(item => item.trim()),
      nutritionalInfo: {
        calories: parseInt(newItem.calories) || 0,
        protein: newItem.protein || '0g',
        carbs: newItem.carbs || '0g',
        fat: newItem.fat || '0g',
        fiber: newItem.fiber || '0g'
      },
      price: parseFloat(newItem.price),
      category: newItem.category,
      isAvailable: true,
      allergens: newItem.allergens.split(',').map(allergen => allergen.trim()).filter(Boolean),
      imageUrl: newItem.imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
    };

    addMenuItem(menuItem);
    setShowAddItem(false);
    setNewItem({
      name: '', description: '', items: '', price: '', category: 'lunchbox',
      calories: '', protein: '', carbs: '', fat: '', fiber: '', allergens: '', imageUrl: ''
    });
    window.location.reload();
  };

  const toggleItemAvailability = (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
      updateMenuItem(itemId, { isAvailable: !item.isAvailable });
      window.location.reload();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">{caterer?.businessName}</h2>
        <p className="text-orange-100">Manage your menu and track orders</p>
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{todayOrders.length}</p>
            <p className="text-orange-100 text-sm">Today's Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">₹{todayRevenue}</p>
            <p className="text-orange-100 text-sm">Today's Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{menuItems.length}</p>
            <p className="text-orange-100 text-sm">Menu Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
            <p className="text-orange-100 text-sm">Rating</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Total Orders</h3>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Customers</h3>
              <p className="text-2xl font-bold text-purple-600">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Rating</h3>
              <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h3>
        <div className="space-y-4">
          {orders.slice(-10).reverse().map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold">{order.childName}</span>
                    <span className="text-sm text-gray-500">#{order.qrCode}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Items:</strong> {order.items.map(item => item.menuItem.name).join(', ')}</p>
                    <p><strong>School:</strong> {order.schoolName}</p>
                    <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'picked' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                  </span>
                  <p className="text-lg font-bold text-gray-800 mt-1">₹{order.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Popular Menu Items</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {menuItems.slice(0, 3).map((item) => {
            const itemOrders = orders.filter(order => 
              order.items.some(orderItem => orderItem.menuItem.id === item.id)
            ).length;
            
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                  <span className="text-sm text-gray-500">{itemOrders} orders</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Menu Management</h3>
        <button
          onClick={() => setShowAddItem(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                <button
                  onClick={() => toggleItemAvailability(item.id)}
                  className={`p-1 rounded ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}
                >
                  {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-green-600">₹{item.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Calories:</span>
                  <span>{item.nutritionalInfo.calories}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="capitalize">{item.category.replace('-', ' ')}</span>
                </div>
              </div>

              {item.allergens.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-red-600 mb-1">Allergens:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.allergens.map((allergen) => (
                      <span key={allergen} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.isAvailable ? 'Available' : 'Out of Stock'}
                </span>
                <button
                  onClick={() => setEditingItem(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Menu Item</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Classic Vegetarian Thali"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="120"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Traditional Indian vegetarian meal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items Included</label>
                <input
                  type="text"
                  value={newItem.items}
                  onChange={(e) => setNewItem({ ...newItem, items: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Rice, Dal, Vegetables, Roti (comma separated)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="lunchbox">Lunchbox</option>
                    <option value="fruit-bowl">Fruit Bowl</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                  <input
                    type="number"
                    value={newItem.calories}
                    onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protein</label>
                  <input
                    type="text"
                    value={newItem.protein}
                    onChange={(e) => setNewItem({ ...newItem, protein: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="15g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Carbs</label>
                  <input
                    type="text"
                    value={newItem.carbs}
                    onChange={(e) => setNewItem({ ...newItem, carbs: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="65g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fat</label>
                  <input
                    type="text"
                    value={newItem.fat}
                    onChange={(e) => setNewItem({ ...newItem, fat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="12g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fiber</label>
                  <input
                    type="text"
                    value={newItem.fiber}
                    onChange={(e) => setNewItem({ ...newItem, fiber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="8g"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
                <input
                  type="text"
                  value={newItem.allergens}
                  onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="nuts, dairy (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="https://images.pexels.com/..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddItem(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Analytics & Insights</h3>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">₹{Math.round(totalRevenue / 30)}</p>
            <p className="text-gray-600">Daily Average</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">₹{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}</p>
            <p className="text-gray-600">Avg Order Value</p>
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Most Popular Items</h4>
        <div className="space-y-3">
          {menuItems.map((item) => {
            const itemOrders = orders.filter(order => 
              order.items.some(orderItem => orderItem.menuItem.id === item.id)
            ).length;
            const percentage = orders.length > 0 ? Math.round((itemOrders / orders.length) * 100) : 0;
            
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">₹{item.price}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{itemOrders} orders</p>
                  <p className="text-sm text-gray-600">{percentage}% of total</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Feedback */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Feedback</h4>
        <div className="space-y-4">
          {mockFeedback.filter(f => f.catererId === caterer?.id).map((feedback) => (
            <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{feedback.rating}/5</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(feedback.timestamp).toLocaleDateString('en-IN')}
                </span>
              </div>
              <p className="text-gray-700">{feedback.comment}</p>
            </div>
          ))}
        </div>
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
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Menu</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'menu' && renderMenu()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default CatererDashboard;