import api, { endpoints } from './api';

class DeliveryService {
  async setAvailability(status: 'available' | 'busy' | 'offline') {
    const response = await api.put('/deliveries/availability', { status });
    return response.data;
  }

  async getTodayDeliveries() {
    const response = await api.get('/deliveries/today');
    return response.data;
  }

  async getAllDeliveries() {
    const response = await api.get('/deliveries/all');
    return response.data;
  }

  async getLeaderboard() {
    const response = await api.get('/deliveries/leaderboard');
    return response.data;
  }
}

export default new DeliveryService();