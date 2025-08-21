import api, { endpoints } from './api';

export interface Child {
  id?: string;
  name: string;
  schoolName: string;
  schoolId?: string;
  class: string;
  age?: number;
  allergies?: string;
  preferences?: string;
}

class UserService {
  async addChild(childData: Child) {
    const response = await api.post(endpoints.children, childData);
    return response.data;
  }

  async getChildren() {
    const response = await api.get(endpoints.children);
    return response.data;
  }

  async updateChild(id: string, childData: Partial<Child>) {
    const response = await api.put(`${endpoints.children}/${id}`, childData);
    return response.data;
  }

  async deleteChild(id: string) {
    const response = await api.delete(`${endpoints.children}/${id}`);
    return response.data;
  }

  async updateLoyaltyPoints(points: number) {
    const response = await api.put(endpoints.loyaltyPoints, { points });
    return response.data;
  }
}

export default new UserService();