import api, { endpoints } from './api';

export interface MenuItemData {
  name: string;
  description?: string;
  items: string;
  price: number;
  category: 'lunchbox' | 'fruit_bowl' | 'other'; // Updated to match database enum
  imageUrl?: string; // Maps to image_url in database
  allergens?: string[] | string; // Will be converted to array in backend
  calories?: number;
  proteinGrams?: number; // Maps to protein_grams in database
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
}

class MenuService {
  async createMenuItem(menuData: MenuItemData) {
    // Format data for backend
    const formattedData = {
      ...menuData,
      allergens: Array.isArray(menuData.allergens) 
        ? menuData.allergens.join(',') 
        : menuData.allergens || '',
      proteinGrams: menuData.proteinGrams || Number(menuData.protein) || 0
    };
    
    const response = await api.post(endpoints.menu, formattedData);
    return response.data;
  }

  async getMenuItems() {
    const response = await api.get(endpoints.menu);
    return response.data;
  }

  async updateMenuItem(id: string, menuData: Partial<MenuItemData>) {
    // Format data for backend
    const formattedData = {
      ...menuData,
      allergens: Array.isArray(menuData.allergens) 
        ? menuData.allergens.join(',') 
        : menuData.allergens || '',
      proteinGrams: menuData.proteinGrams || Number(menuData.protein) || 0
    };
    
    const response = await api.put(`${endpoints.menu}/${id}`, formattedData);
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