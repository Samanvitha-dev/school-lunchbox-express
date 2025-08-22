import React, { useEffect, useState } from 'react';
import { User, Clock, CheckCircle, AlertTriangle, Users, Calendar, Package, TrendingUp } from 'lucide-react';
import schoolService from '../services/schoolService';
import { useAuth } from '../context/AuthContext';

const SchoolDashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [classSummary, setClassSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchoolData();
  }, []);

  const loadSchoolData = async () => {
    try {
      setLoading(true);
      
      // Load today's expected deliveries
      const todayResponse = await schoolService.getTodayExpectedDeliveries();
      setTodayOrders(todayResponse.orders || []);
      
      // Load all deliveries for statistics
      const allResponse = await schoolService.getAllDeliveries();
      setAllOrders(allResponse.orders || []);
      
      // Load class summary
      const summaryResponse = await schoolService.getClassSummary();
      setClassSummary(summaryResponse.classes || []);
      
    } catch (error) {
      console.error('Error loading school data:', error);
      setTodayOrders([]);
      setAllOrders([]);
      setClassSummary([]);
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

  const totalExpected = todayOrders.length;
  const totalDelivered = todayOrders.filter(order => order.status === 'delivered').length;
  const totalPending = todayOrders.filter(order => order.status !== 'delivered').length;

  if (loading) {
    return (
      <div className="p-4">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6 mb-4">
          <h2 className="text-xl font-bold">School Delivery Dashboard</h2>
          <p className="text-purple-100">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold">School Delivery Dashboard</h2>
        <p className="text-purple-100">Welcome, {user?.schoolName || user?.school_name || 'School Admin'}</p>
        <p className="text-purple-200 text-sm">Managing lunch deliveries for {user?.schoolId || user?.school_id || 'your school'}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Expected Today</p>
              <p className="text-2xl font-bold text-blue-600">{totalExpected}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{totalDelivered}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{totalPending}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Classes</p>
              <p className="text-2xl font-bold text-purple-600">{classSummary.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Class Summary */}
      {classSummary.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Class-wise Delivery Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classSummary.map((classData: any) => (
              <div key={classData.class} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-800">{classData.class}</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected:</span>
                    <span className="font-medium">{classData.expected || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Received:</span>
                    <span className="font-medium text-green-600">{classData.received || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600">Pending:</span>
                    <span className="font-medium text-orange-600">{classData.missing || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Today's Expected Deliveries ({new Date().toLocaleDateString('en-IN')})
          </h3>
          <button 
            onClick={loadSchoolData}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
          >
            Refresh
          </button>
        </div>
        
        {todayOrders.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No deliveries expected for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayOrders.map((order) => (
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
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Expected: {order.delivery_time}</span>
                      </div>
                      {order.delivery_person_name && (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Delivery Partner: {order.delivery_person_name}</span>
                        </div>
                      )}
                      {order.special_notes && (
                        <div className="text-xs text-gray-500">
                          Notes: {order.special_notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">₹{order.amount}</div>
                    <div className="text-xs text-gray-500">Order #{order.qr_code}</div>
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

export default SchoolDashboard;