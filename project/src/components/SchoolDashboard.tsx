import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { School, LunchboxOrder } from '../types';
import { getOrdersBySchoolId } from '../data/mockDatabase';
import { User, Clock, CheckCircle, AlertTriangle, Users, Calendar } from 'lucide-react';

const SchoolDashboard: React.FC = () => {
  const { userDetails } = useAuth();
  const school = userDetails as School;
  const [activeTab, setActiveTab] = useState('dashboard');

  const allOrders = getOrdersBySchoolId(school?.id || '');
  const todayOrders = allOrders.filter(order => 
    new Date(order.orderDate).toDateString() === new Date().toDateString()
  );

  const expectedOrders = todayOrders.filter(order => 
    ['confirmed', 'picked', 'in-transit'].includes(order.status)
  );
  const receivedOrders = todayOrders.filter(order => order.status === 'delivered');
  const missingOrders = todayOrders.filter(order => 
    order.status === 'pending' || (new Date().getHours() > 13 && order.status !== 'delivered')
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'picked': return 'bg-orange-100 text-orange-800';
      case 'in-transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">{school?.schoolName}</h2>
        <p className="text-purple-100">Lunch Delivery Management</p>
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{todayOrders.length}</p>
            <p className="text-purple-100 text-sm">Total Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{expectedOrders.length}</p>
            <p className="text-purple-100 text-sm">Expected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{receivedOrders.length}</p>
            <p className="text-purple-100 text-sm">Received</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{missingOrders.length}</p>
            <p className="text-purple-100 text-sm">Missing</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Expected Deliveries</h3>
              <p className="text-2xl font-bold text-blue-600">{expectedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Successfully Received</h3>
              <p className="text-2xl font-bold text-green-600">{receivedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Missing Deliveries</h3>
              <p className="text-2xl font-bold text-red-600">{missingOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Expected Deliveries */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Today's Expected Deliveries</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {todayOrders.length > 0 ? (
          <div className="space-y-4">
            {todayOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{order.childName}</span>
                      <span className="text-sm text-gray-500">#{order.qrCode}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800">Expected Time</p>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{order.deliveryTime}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Pickup Address</p>
                        <p className="truncate">{order.pickupAddress}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Parent Contact</p>
                        <p className="text-blue-600">+91-XXXXXXXXX</p>
                      </div>
                    </div>

                    {order.specialNotes && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Special Instructions:</strong> {order.specialNotes}
                        </p>
                      </div>
                    )}

                    {order.status === 'delivered' && order.actualDeliveryTime && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Delivered at {order.actualDeliveryTime}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                    </span>
                    
                    {order.status !== 'delivered' && new Date().getHours() > 13 && (
                      <div>
                        <span className="block text-xs text-red-600 font-medium">
                          ⚠️ Overdue
                        </span>
                      </div>
                    )}

                    {order.status === 'delivered' && (
                      <div className="text-xs text-green-600">
                        ✅ Confirmed Receipt
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status !== 'delivered' && (
                  <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                    <button className="px-4 py-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 text-sm">
                      Contact Parent
                    </button>
                    <button className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm">
                      Track Delivery
                    </button>
                    {new Date().getHours() > 13 && (
                      <button className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 text-sm">
                        Report Missing
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No deliveries expected for today</p>
          </div>
        )}
      </div>

      {/* Class-wise Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Class-wise Delivery Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {school?.classes?.slice(0, 8).map((className) => {
            const classOrders = todayOrders.filter(order => 
              order.childName.includes(className) // Simple logic for demo
            );
            return (
              <div key={className} className="border border-gray-200 rounded-lg p-4 text-center">
                <h4 className="font-semibold text-gray-800">{className}</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Expected: <span className="font-medium">{Math.floor(Math.random() * 5) + 1}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Received: <span className="font-medium text-green-600">{Math.floor(Math.random() * 3) + 1}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Missing: <span className="font-medium text-red-600">{Math.floor(Math.random() * 2)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAllDeliveries = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">All Delivery Records</h3>
      <div className="space-y-4">
        {allOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">{order.childName}</span>
                  <span className="text-sm text-gray-500">#{order.qrCode}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-800">Date</p>
                    <p>{new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Expected Time</p>
                    <p>{order.deliveryTime}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Actual Time</p>
                    <p>{order.actualDeliveryTime || 'Not delivered'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Pickup Address</p>
                    <p className="truncate">{order.pickupAddress}</p>
                  </div>
                </div>

                {order.specialNotes && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Special Instructions:</strong> {order.specialNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                </span>
                {order.status === 'delivered' && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Received & Confirmed
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
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('all-deliveries')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-deliveries'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Deliveries
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'all-deliveries' && renderAllDeliveries()}
      </div>
    </div>
  );
};

export default SchoolDashboard;