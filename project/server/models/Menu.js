const db = require('../config/database');

class Menu {
  static async create(menuData) {
    const {
      catererId, name, description, items, price, category,
      imageUrl, allergens, calories, proteinGrams, protein, carbs, fat, fiber
    } = menuData;
    
    const result = await db.query(
      `INSERT INTO menu_items (
        caterer_id, name, description, price, calories, protein_grams, category,
        allergens, image_url, is_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        catererId, 
        name, 
        description || '', 
        price, 
        calories || 0, 
        proteinGrams || 0, 
        category,
        allergens || [], 
        imageUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 
        true
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
        name = COALESCE($1, name), 
        description = COALESCE($2, description), 
        price = COALESCE($3, price), 
        category = COALESCE($4, category),
        image_url = COALESCE($5, image_url), 
        allergens = COALESCE($6, allergens), 
        calories = COALESCE($7, calories), 
        protein_grams = COALESCE($8, protein_grams), 
        is_available = COALESCE($9, is_available), 
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [
        name, description, price, category,
        imageUrl, allergens, calories, proteinGrams, isAvailable, id
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