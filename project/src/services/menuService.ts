import api, { endpoints } from './api';

export interface MenuItemData {
  name: string;
  description?: string;
  items: string;
  price: number;
  category: 'lunchbox' | 'fruit-bowl' | 'snack';
  imageUrl?: string;
  allergens?: string;
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
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