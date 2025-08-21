const db = require('../config/database');

class Menu {
  static async create(menuData) {
    const {
      catererId, name, description, items, price, category,
      imageUrl, allergens, calories, protein, carbs, fat, fiber
    } = menuData;
    
    const result = await db.query(
      `INSERT INTO menu_items (
        caterer_id, name, description, items, price, category,
        image_url, allergens, calories, protein, carbs, fat, fiber
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        catererId, name, description, items, price, category,
        imageUrl, allergens || [], calories, protein, carbs, fat, fiber
      ]
    );
    
    return result.rows[0];
  }

  static async findByCatererId(catererId) {
    const result = await db.query(
      'SELECT * FROM menu_items WHERE caterer_id = $1 ORDER BY created_at DESC',
      [catererId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id, updateData) {
    const {
      name, description, items, price, category,
      imageUrl, allergens, calories, protein, carbs, fat, fiber, isAvailable
    } = updateData;
    
    const result = await db.query(
      `UPDATE menu_items SET 
        name = $1, description = $2, items = $3, price = $4, category = $5,
        image_url = $6, allergens = $7, calories = $8, protein = $9, carbs = $10, 
        fat = $11, fiber = $12, is_available = $13, updated_at = CURRENT_TIMESTAMP
       WHERE id = $14 RETURNING *`,
      [
        name, description, items, price, category,
        imageUrl, allergens || [], calories, protein, carbs, fat, fiber, isAvailable, id
      ]
    );
    
    return result.rows[0];
  }

  static async toggleAvailability(id) {
    const result = await db.query(
      'UPDATE menu_items SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM menu_items WHERE id = $1', [id]);
    return true;
  }

  static async getAll() {
    const result = await db.query('SELECT * FROM menu_items ORDER BY created_at DESC');
    return result.rows;
  }

  static async getAvailable() {
    const result = await db.query(
      'SELECT * FROM menu_items WHERE is_available = true ORDER BY category, name'
    );
    return result.rows;
  }
}

module.exports = Menu;