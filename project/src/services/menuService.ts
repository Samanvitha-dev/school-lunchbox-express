import api, { endpoints } from './api';

export interface MenuItemData {
  name: string;
  description?: string;
  price: number;
  category: 'lunchbox' | 'fruit_bowl' | 'other';
  imageUrl?: string;
  allergens?: string[] | string;
  calories?: number;
  proteinGrams?: number;
}

class MenuService {
  async createMenuItem(menuData: MenuItemData) {
    const response = await api.post(endpoints.menu, menuData);
    return response.data;
  }

  async getMenuItems() {
    const response = await api.get(endpoints.menu);
    return response.data;
  }

  async updateMenuItem(id: string, menuData: Partial<MenuItemData>) {
    const response = await api.put(`${endpoints.menu}/${id}`, menuData);
    return response.data;
  }

  async toggleAvailability(id: string) {
    const response = await api.put(endpoints.menuToggle(id));
    return response.data;
  }

  async deleteMenuItem(id: string) {
    const response = await api.delete(`${endpoints.menu}/${id}`);
    return response.data;
  }
}

export default new MenuService();