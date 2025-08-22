import api, { endpoints } from './api';

export interface OrderData {
  parentId?: string;
  childId: string;
  orderDate: string;
  deliveryTime: string;
  specialNotes?: string;
  isRecurring?: boolean;
  recurringDays?: string[];
  orderType: 'home' | 'caterer';
  items?: any[];
  loyaltyPointsUsed?: number;
}

class OrderService {
  async createOrder(orderData: OrderData) {
    const response = await api.post(endpoints.orders, orderData);
    return response.data;
  }

  async getOrders() {
    const response = await api.get(endpoints.orders);
    return response.data;
  }

  async getTodayOrders() {
    const response = await api.get(endpoints.todayOrders);
    return response.data;
  }

  async getPendingOrders() {
    const response = await api.get(`${endpoints.orders}/pending`);
    return response.data;
  }

  async acceptOrder(orderId: string) {
    const response = await api.put(`${endpoints.orders}/${orderId}/accept`);
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const response = await api.put(endpoints.orderStatus(orderId), { status });
    return response.data;
  }

  async reorderWeekday(orderId: string, weekday: number | string) {
    const response = await api.post(`${endpoints.orders}/reorder-weekday`, { orderId, weekday });
    return response.data;
  }

  async getConfirmedDates() {
    const response = await api.get(`${endpoints.orders}/confirmed-dates`);
    return response.data;
  }
}

export default new OrderService();