const Menu = require('../models/Menu');
const Notification = require('../models/Notification');

const menuController = {
  async createMenuItem(req, res) {
    try {
      const { name, description, price, category, imageUrl, allergens, calories, proteinGrams } = req.body;
      
      const menuData = {
        catererId: req.user.id,
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        allergens: Array.isArray(allergens)
          ? allergens
          : (typeof allergens === 'string' && allergens.length > 0
            ? allergens.split(',').map(allergen => allergen.trim())
            : []),
        calories: parseInt(calories) || 0,
        proteinGrams: parseInt(proteinGrams) || 0
      };
      
      const menuItem = await Menu.create(menuData);
      
      res.status(201).json({
        message: 'Menu item created successfully',
        menuItem
      });
    } catch (error) {
      console.error('Create menu item error:', error);
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  },

  async getMenuItems(req, res) {
    try {
      let items = [];
      
      if (req.user.user_type === 'caterer') {
        items = await Menu.findByCatererId(req.user.id);
      } else {
        // For parents and others, get all available items
        items = await Menu.getAvailable();
      }
      
      res.json({ items });
    } catch (error) {
      console.error('Get menu items error:', error);
      res.status(500).json({ error: 'Failed to get menu items' });
    }
  },

  async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      if (updateData.allergens && typeof updateData.allergens === 'string') {
        updateData.allergens = updateData.allergens.split(',').map(allergen => allergen.trim());
      }
      if (typeof updateData.calories !== 'undefined') {
        updateData.calories = parseInt(updateData.calories) || 0;
      }
      if (typeof updateData.proteinGrams !== 'undefined') {
        updateData.proteinGrams = parseInt(updateData.proteinGrams) || 0;
      }
      if (typeof updateData.price !== 'undefined') {
        updateData.price = parseFloat(updateData.price);
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