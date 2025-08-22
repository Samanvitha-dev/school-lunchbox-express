import api, { endpoints } from './api';

export interface Child {
  id?: string;
  name: string;
  schoolName: string; // Maps to school_name in database
  schoolId?: string; // Maps to school_id in database  
  class: string; // Maps to class in database
  age?: number;
  allergies?: string; // Will be converted to array in backend
  preferences?: string; // Will be converted to array in backend
}

class UserService {
  async addChild(childData: Child) {
    // Ensure data is properly formatted for backend
    const formattedData = {
      name: childData.name,
      schoolName: childData.schoolName,
      schoolId: childData.schoolId || '',
      class: childData.class,
      age: childData.age || 8,
      allergies: childData.allergies || '',
      preferences: childData.preferences || ''
    };
    
    const response = await api.post(endpoints.children, formattedData);
    return response.data;
  }

  async getChildren() {
    const response = await api.get(endpoints.children);
    return response.data;
  }

  async updateChild(id: string, childData: Partial<Child>) {
    // Ensure data is properly formatted for backend
    const formattedData = {
      name: childData.name,
      schoolName: childData.schoolName,
      schoolId: childData.schoolId || '',
      class: childData.class,
      age: childData.age || 8,
      allergies: childData.allergies || '',
      preferences: childData.preferences || ''
    };
    
    const response = await api.put(`${endpoints.children}/${id}`, formattedData);
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