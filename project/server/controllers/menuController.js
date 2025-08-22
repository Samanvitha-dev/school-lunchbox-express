const Menu = require('../models/Menu');
const Notification = require('../models/Notification');

const menuController = {
  async createMenuItem(req, res) {
    try {
      const { name, description, items, price, category, imageUrl, allergens, calories, proteinGrams, protein, carbs, fat, fiber } = req.body;
      
      const menuData = {
        catererId: req.user.id,
        name,
        description: description || '',
        items: typeof items === 'string' ? items.split(',').map(item => item.trim()) : items,
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        allergens: typeof allergens === 'string' 
          ? allergens.split(',').map(allergen => allergen.trim()).filter(Boolean)
          : allergens || [],
        calories: parseInt(calories) || 0,
        proteinGrams: parseInt(proteinGrams) || parseInt(protein) || 0, // Handle both field names
        protein: protein || '0g',
        carbs: carbs || '0g',
        fat: fat || '0g',
        fiber: fiber || '0g'
      };
      
      const menuItem = await Menu.create(menuData);
      
      res.status(201).json({
        message: 'Menu item created successfully',
        menuItem
      });
    } catch (error) {
      console.error('Create menu item error:', error);
      res.status(500).json({ error: error.message || 'Failed to create menu item' });
    }
  },

  async getMenuItems(req, res) {
    try {
      let menuItems = [];
      
      if (req.user.userType === 'caterer' || req.user.user_type === 'caterer') {
        menuItems = await Menu.findByCatererId(req.user.id);
      } else {
        // For parents and others, get all available items
        menuItems = await Menu.getAvailable();
      }
      
      res.json({ items: menuItems }); // Changed from menuItems to items to match frontend
    } catch (error) {
      console.error('Get menu items error:', error);
      res.status(500).json({ error: 'Failed to get menu items' });
    }
  },

  async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Handle items field
      if (updateData.items && typeof updateData.items === 'string') {
        updateData.items = updateData.items.split(',').map(item => item.trim());
      }
      
      // Handle allergens field
      if (updateData.allergens && typeof updateData.allergens === 'string') {
        updateData.allergens = updateData.allergens.split(',').map(allergen => allergen.trim()).filter(Boolean);
      }
      
      // Handle protein field mapping
      if (updateData.proteinGrams) {
        updateData.proteinGrams = parseInt(updateData.proteinGrams) || 0;
      } else if (updateData.protein && typeof updateData.protein === 'string' && updateData.protein.includes('g')) {
        updateData.proteinGrams = parseInt(updateData.protein) || 0;
      }
      
      const menuItem = await Menu.update(id, updateData);
      
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      res.json({
        message: 'Menu item updated successfully',
        menuItem
      });
    } catch (error) {
      console.error('Update menu item error:', error);
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  },

  async toggleAvailability(req, res) {
    try {
      const { id } = req.params;
      const menuItem = await Menu.toggleAvailability(id);
      
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      res.json({
        message: 'Menu item availability updated successfully',
        menuItem
      });
    } catch (error) {
      console.error('Toggle availability error:', error);
      res.status(500).json({ error: 'Failed to toggle availability' });
    }
  },

  async deleteMenuItem(req, res) {
    try {
      const { id } = req.params;
      await Menu.delete(id);
      
      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      console.error('Delete menu item error:', error);
      res.status(500).json({ error: 'Failed to delete menu item' });
    }
  }
};

module.exports = menuController;