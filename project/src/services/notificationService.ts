import api, { endpoints } from './api';

class NotificationService {
  async getNotifications() {
    const response = await api.get(endpoints.notifications);
    return response.data;
  }

  async markAsRead(id: string) {
    const response = await api.put(endpoints.markAsRead(id));
    return response.data;
  }

  async markAllAsRead() {
    const response = await api.put(endpoints.markAllAsRead);
    return response.data;
  }

  async getUnreadCount() {
    const response = await api.get(endpoints.unreadCount);
    return response.data;
  }
}

export default new NotificationService();