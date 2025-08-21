import React, { useState } from 'react';
import { 
  mockParents, 
  mockDeliveryStaff, 
  mockSchools, 
  mockOrders, 
  mockChildren,
  getAllUsers
} from '../data/mockDatabase';
import { 
  Users, 
  Truck, 
  School, 
  Package, 
  TrendingUp, 
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const totalUsers = getAllUsers().length;
  const totalParents = mockParents.length;
  const totalDeliveryStaff = mockDeliveryStaff.length;
  const totalSchools = mockSchools.length;
  const totalOrders = mockOrders.length;
  const totalChildren = mockChildren.length;

  const todayOrders = mockOrders.filter(order => 
    new Date(order.orderDate).toDateString() === new Date().toDateString()
  );

  const pendingOrders = todayOrders.filter(order => order.status === 'pending').length;
  const inTransitOrders = todayOrders.filter(order => ['picked', 'in-transit'].includes(order.status)).length;
  const deliveredOrders = todayOrders.filter(order => order.status === 'delivered').length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.amount, 0);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.amount, 0);

  const activeDeliveryStaff = mockDeliveryStaff.filter(staff => staff.isActive).length;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{totalOrders}</p>
            </div>
            <Package className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Today's Orders</p>
              <p className="text-3xl font-bold">{todayOrders.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Today's Performance</h3>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
            <p className="text-sm text-gray-600">Pending Orders</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{inTransitOrders}</p>
            <p className="text-sm text-gray-600">In Transit</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
            <p className="text-sm text-gray-600">Delivered</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">₹{todayRevenue}</p>
            <p className="text-sm text-gray-600">Today's Revenue</p>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Parents</span>
              </div>
              <span className="font-semibold">{totalParents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Delivery Partners</span>
              </div>
              <span className="font-semibold">{totalDeliveryStaff}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Schools</span>
              </div>
              <span className="font-semibold">{totalSchools}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Children</span>
              </div>
              <span className="font-semibold">{totalChildren}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Staff Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Active Partners</span>
              </div>
              <span className="font-semibold">{activeDeliveryStaff}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Busy Partners</span>
              </div>
              <span className="font-semibold">
                {mockDeliveryStaff.filter(staff => staff.currentStatus === 'busy').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Available Partners</span>
              </div>
              <span className="font-semibold">
                {mockDeliveryStaff.filter(staff => staff.currentStatus === 'available').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Offline Partners</span>
              </div>
              <span className="font-semibold">
                {mockDeliveryStaff.filter(staff => !staff.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockOrders.slice(-10).reverse().map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.childName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.schoolName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'picked' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.amount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Parents */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Parents</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-3">
            {mockParents.map((parent) => (
              <div key={parent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{parent.username}</p>
                  <p className="text-sm text-gray-600">{parent.noOfChildren} children</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {parent.cityName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Staff */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Delivery Partners</h3>
            <Truck className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-3">
            {mockDeliveryStaff.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{staff.name}</p>
                  <p className="text-sm text-gray-600">Rating: {staff.rating}/5</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  staff.currentStatus === 'available' ? 'bg-green-100 text-green-800' :
                  staff.currentStatus === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {staff.currentStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Schools */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Schools</h3>
            <School className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-3">
            {mockSchools.map((school) => (
              <div key={school.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{school.schoolName}</p>
                  <p className="text-sm text-gray-600">Est. {school.establishedYear}</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {school.classes.length} classes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Revenue Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Revenue Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">₹{todayRevenue}</p>
            <p className="text-gray-600">Today's Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">₹{Math.round(totalRevenue / mockOrders.length)}</p>
            <p className="text-gray-600">Avg Order Value</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">₹{Math.round(totalRevenue / 30)}</p>
            <p className="text-gray-600">Daily Average</p>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Order Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['pending', 'confirmed', 'picked', 'in-transit', 'delivered'].map((status) => {
            const count = mockOrders.filter(order => order.status === status).length;
            const percentage = Math.round((count / mockOrders.length) * 100);
            return (
              <div key={status} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 ${
                  status === 'pending' ? 'bg-yellow-500' :
                  status === 'confirmed' ? 'bg-blue-500' :
                  status === 'picked' ? 'bg-orange-500' :
                  status === 'in-transit' ? 'bg-purple-500' : 'bg-green-500'
                }`}>
                  {count}
                </div>
                <p className="font-medium capitalize">{status.replace('-', ' ')}</p>
                <p className="text-sm text-gray-600">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Delivery Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">On-time Deliveries</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Average Delivery Time</span>
              <span className="font-semibold">23 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Customer Satisfaction</span>
              <span className="font-semibold text-yellow-600">4.8/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Successful Deliveries</span>
              <span className="font-semibold text-blue-600">98.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Growth Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">New Users This Month</span>
              <span className="font-semibold text-green-600">+25</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Orders Growth</span>
              <span className="font-semibold text-blue-600">+18%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Revenue Growth</span>
              <span className="font-semibold text-purple-600">+22%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Active Schools</span>
              <span className="font-semibold">{mockSchools.length}/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600 mt-2">Comprehensive overview of the LunchBox Express system</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default AdminDashboard;