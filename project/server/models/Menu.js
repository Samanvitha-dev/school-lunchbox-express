const db = require('../config/database');

class Menu {
  static async create(menuData) {
    const {
      catererId, name, description, price, category,
      imageUrl, allergens, calories, proteinGrams
    } = menuData;
    
    const result = await db.query(
      `INSERT INTO menu_items (
        caterer_id, name, description, price, category,
        image_url, allergens, calories, protein_grams
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        catererId, name, description || null, price, category,
        imageUrl, Array.isArray(allergens) ? allergens : [], calories || 0, proteinGrams || 0
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
      name, description, price, category,
      imageUrl, allergens, calories, proteinGrams, isAvailable
    } = updateData;
    
    const result = await db.query(
      `UPDATE menu_items SET 
        name = $1, description = $2, price = $3, category = $4,
        image_url = $5, allergens = $6, calories = $7, protein_grams = $8, is_available = COALESCE($9, is_available), updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [
        name, description || null, price, category,
        imageUrl, Array.isArray(allergens) ? allergens : [], calories || 0, proteinGrams || 0, isAvailable, id
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