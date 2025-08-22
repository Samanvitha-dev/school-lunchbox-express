import React, { useEffect, useState } from 'react';
import { User, Clock, CheckCircle, AlertTriangle, Users, Calendar } from 'lucide-react';
import schoolService from '../services/schoolService';

const SchoolDashboard: React.FC = () => {
  const [todayOrders, setTodayOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { orders } = await schoolService.getTodayExpectedDeliveries();
        setTodayOrders(orders || []);
      } catch {
        setTodayOrders([]);
      }
    })();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6 mb-4">
        <h2 className="text-xl font-bold">School Delivery Dashboard</h2>
        <p className="text-purple-100">Lunch Delivery Management</p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-IN')}</span>
        </div>
        {todayOrders.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No deliveries expected for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayOrders.map((order) => (
              <div key={order.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{order.child_name}</div>
                  <div className="text-sm text-gray-600">ETA: {order.delivery_time}</div>
                </div>
                <div className="text-xs text-gray-600">Rider: {order.delivery_person_name || '-'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDashboard;