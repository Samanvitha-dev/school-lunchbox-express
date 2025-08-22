import React, { useEffect, useMemo, useState } from 'react';
import { Package, Star, Plus, Edit, Trash2, CheckCircle, XCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import menuService, { MenuItemData } from '../services/menuService';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const CatererDashboard: React.FC = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    items: '',
    price: '',
    calories: '',
    proteinGrams: '', // Changed from 'protein' to match database field
    category: 'lunchbox',
    allergens: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const loadData = async () => {
    try {
      setDataLoading(true);
      
      // Load menu items
      const menuResp = await menuService.getMenuItems();
      setMenuItems(menuResp.items || []);
      
      // Load orders for this caterer
      const ordersResp = await orderService.getOrders();
      setOrders(ordersResp.orders || []);
      
    } catch (error) {
      console.error('Error loading caterer data:', error);
      setMenuItems([]);
      setOrders([]);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newItem.name || !newItem.price || !newItem.items) {
      alert('Please fill in all required fields (Name, Price, Items)');
      return;
    }
    
    try {
      setLoading(true);
      await menuService.createMenuItem({
        name: newItem.name,
        description: newItem.description,
        items: newItem.items,
        price: Number(newItem.price || 0),
        calories: Number(newItem.calories || 0),
        proteinGrams: Number(newItem.proteinGrams || 0),
        category: newItem.category as any,
        allergens: newItem.allergens.split(',').map(a => a.trim()).filter(Boolean),
        imageUrl: newItem.imageUrl
      } as MenuItemData);
      
      await loadData(); // Refresh data
      setNewItem({ 
        name: '', 
        description: '', 
        items: '', 
        price: '', 
        calories: '', 
        proteinGrams: '', 
        category: 'lunchbox', 
        allergens: '', 
        imageUrl: '' 
      });
      alert('Menu item created successfully!');
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (dataLoading) {
    return (
      <div className="p-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6 mb-4">
          <h2 className="text-xl font-bold">Caterer Dashboard</h2>
          <p className="text-orange-100">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold">Caterer Dashboard</h2>
        <p className="text-orange-100">Welcome, {user?.businessName || user?.business_name || 'Caterer'}</p>
        <p className="text-orange-200 text-sm">Managing your menu and orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Menu Items</p>
              <p className="text-2xl font-bold text-orange-600">{menuItems.length}</p>
            </div>
            <Package className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Order</p>
              <p className="text-2xl font-bold text-purple-600">₹{averageOrderValue.toFixed(0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Menu Item Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Menu Item
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                placeholder="Name*" 
                value={newItem.name} 
                onChange={e=>setNewItem({...newItem,name:e.target.value})}
              />
              <input 
                className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                placeholder="Price*" 
                type="number"
                value={newItem.price} 
                onChange={e=>setNewItem({...newItem,price:e.target.value})}
              />
            </div>
            
            <input 
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              placeholder="Items* (comma separated)" 
              value={newItem.items} 
              onChange={e=>setNewItem({...newItem,items:e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <select 
                className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                value={newItem.category} 
                onChange={e=>setNewItem({...newItem,category:e.target.value})}
              >
                <option value="lunchbox">Lunchbox</option>
                <option value="fruit_bowl">Fruit Bowl</option>
                <option value="other">Other</option>
              </select>
              
              <input 
                className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                placeholder="Calories" 
                type="number"
                value={newItem.calories} 
                onChange={e=>setNewItem({...newItem,calories:e.target.value})}
              />
            </div>
            
            <input 
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              placeholder="Protein (grams)" 
              type="number"
              value={newItem.proteinGrams} 
              onChange={e=>setNewItem({...newItem,proteinGrams:e.target.value})}
            />
            
            <input 
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              placeholder="Allergens (comma separated)" 
              value={newItem.allergens} 
              onChange={e=>setNewItem({...newItem,allergens:e.target.value})}
            />
            
            <input 
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              placeholder="Image URL" 
              value={newItem.imageUrl} 
              onChange={e=>setNewItem({...newItem,imageUrl:e.target.value})}
            />
            
            <textarea 
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
              placeholder="Description" 
              rows={3}
              value={newItem.description} 
              onChange={e=>setNewItem({...newItem,description:e.target.value})}
            />
          </div>
          
          <button 
            disabled={loading || !newItem.name || !newItem.price || !newItem.items} 
            onClick={handleCreate} 
            className="w-full mt-4 px-4 py-3 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors font-medium"
          >
            {loading ? 'Creating...' : 'Create Menu Item'}
          </button>
        </div>
        
        {/* Menu Items List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Menu Items ({menuItems.length})
            </h3>
            <button 
              onClick={loadData}
              className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {menuItems.map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 mb-1">{item.name}</div>
                    <div className="text-sm text-gray-600 mb-2">₹{item.price}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mb-2">{item.description}</div>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{item.calories || 0} cal</span>
                      <span>{item.protein_grams || 0}g protein</span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        Allergens: {Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p>No menu items yet. Create your first menu item above!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Recent Orders ({orders.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {orders.slice(0, 10).map((order: any) => (
              <div key={order.id} className="border rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-800">{order.child_name}</div>
                  <div className="text-sm text-gray-600">{order.school_name}</div>
                  <div className="text-xs text-gray-500">{new Date(order.order_date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">₹{order.amount}</div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatererDashboard;