import React, { useEffect, useState } from 'react';
import { Users, Package, TrendingUp, Calendar, UserCheck, Truck, School, ChefHat, BarChart3 } from 'lucide-react';
import orderService from '../services/orderService';
import api, { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdminStats {
  totalUsers: number;
  totalParents: number;
  totalDelivery: number;
  totalSchools: number;
  totalCaterers: number;
  todayOrders: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalParents: 0,
    totalDelivery: 0,
    totalSchools: 0,
    totalCaterers: 0,
    todayOrders: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load user statistics
      const userStatsResp = await api.get(endpoints.userStats);
      const userStats = userStatsResp.data.stats;
      
      // Load orders data
      const allOrdersResp = await orderService.getOrders();
      const allOrders = allOrdersResp.orders || [];
      
      const todayOrdersResp = await orderService.getTodayOrders();
      const todayOrders = todayOrdersResp.orders || [];
      
      // Calculate statistics
      const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0);
      const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;
      
      setStats({
        totalUsers: userStats.total_users || 0,
        totalParents: userStats.total_parents || 0,
        totalDelivery: userStats.total_delivery || 0,
        totalSchools: userStats.total_schools || 0,
        totalCaterers: userStats.total_caterers || 0,
        todayOrders: todayOrders.length,
        totalOrders: allOrders.length,
        totalRevenue,
        averageOrderValue
      });
      
      // Set recent orders (last 10)
      setRecentOrders(allOrders.slice(0, 10));
      
    } catch (error) {
      console.error('Error loading admin data:', error);
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

  if (loading) {
    return (
      <div className="p-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-4">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <p className="text-indigo-100">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-indigo-100">Welcome, {user?.username || 'Admin'}</p>
        <p className="text-indigo-200 text-sm">System overview and management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Orders</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todayOrders}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalOrders}</p>
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalRevenue.toFixed(0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.averageOrderValue.toFixed(0)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* User Type Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Parents</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalParents}</p>
            </div>
            <Users className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Delivery Partners</p>
              <p className="text-xl font-bold text-green-600">{stats.totalDelivery}</p>
            </div>
            <Truck className="w-6 h-6 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Schools</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalSchools}</p>
            </div>
            <School className="w-6 h-6 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Caterers</p>
              <p className="text-xl font-bold text-orange-600">{stats.totalCaterers}</p>
            </div>
            <ChefHat className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Recent Orders ({recentOrders.length})
          </h3>
          <button 
            onClick={loadAdminData}
            className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 transition-colors"
          >
            Refresh
          </button>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="font-medium text-gray-800">{order.child_name}</div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>School: {order.school_name}</div>
                      <div>Date: {new Date(order.order_date).toLocaleDateString()}</div>
                      <div>Delivery Time: {order.delivery_time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">₹{order.amount}</div>
                    <div className="text-xs text-gray-500">#{order.qr_code}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;