import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Menu, X } from 'lucide-react';
import notificationService from '../services/notificationService';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { notifications: apiNotifications } = await notificationService.getNotifications();
      const mapped = (apiNotifications || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: n.created_at,
        isRead: n.is_read,
        type: n.type
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.isRead).length);
    } catch (e) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'parent': return 'Parent';
      case 'delivery': return 'Delivery Partner';
      case 'school': return 'School Admin';
      case 'admin': return 'System Admin';
      case 'caterer': return 'Caterer';
      default: return 'User';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">LB</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-800">LunchBox Express</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{user?.username}</span>
              <span className="ml-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                {getUserTypeLabel(user?.userType || '')}
              </span>
            </span>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatTime(notification.timestamp)}</p>
                          </div>
                          <span className={`w-2 h-2 rounded-full mt-1 ${
                            notification.type === 'success' ? 'bg-green-400' :
                            notification.type === 'warning' ? 'bg-yellow-400' :
                            notification.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                          }`} />
                        </div>
                      </div>
                    )) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-800">{user?.username}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-b-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 p-4">
          <div className="flex flex-col space-y-2">
            <button className="text-left p-2 hover:bg-gray-100 rounded-lg">Dashboard</button>
            <button className="text-left p-2 hover:bg-gray-100 rounded-lg">Orders</button>
            <button className="text-left p-2 hover:bg-gray-100 rounded-lg">Caterers</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;