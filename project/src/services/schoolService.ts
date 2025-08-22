import api from './api';

class SchoolService {
  async getTodayExpectedDeliveries() {
    const response = await api.get('/schools/today');
    return response.data;
  }

  async getAllDeliveries() {
    const response = await api.get('/schools/all');
    return response.data;
  }

  async getClassSummary() {
    const response = await api.get('/schools/class-summary');
    return response.data;
  }
}

export default new SchoolService();