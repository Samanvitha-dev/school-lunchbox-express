import React, { useEffect, useState } from 'react';
import { Users, Package, TrendingUp, Calendar } from 'lucide-react';
import orderService from '../services/orderService';
import userService from '../services/userService';

const AdminDashboard: React.FC = () => {
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const all = await orderService.getOrders();
        setTotalOrdersCount((all.orders || []).length);
        const today = await orderService.getTodayOrders();
        setTodayOrdersCount((today.orders || []).length);
      } catch {}
    })();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Today’s Orders</p>
              <p className="text-3xl font-bold">{todayOrdersCount}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-200" />
          </div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold">{totalOrdersCount}</p>
            </div>
            <Package className="w-10 h-10 text-green-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;