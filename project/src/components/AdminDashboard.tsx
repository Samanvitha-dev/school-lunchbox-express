import React from 'react';
import { Users, Package, TrendingUp, Calendar, MapPin, Clock } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const todayOrders: any[] = [];
  const mockParents: any[] = [];
  const mockDeliveryStaff: any[] = [];
  const mockSchools: any[] = [];
  const mockOrders: any[] = [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Today’s Orders</p>
              <p className="text-3xl font-bold">{todayOrders.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;