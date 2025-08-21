const db = require('../config/database');

class Student {
  static async create(studentData) {
    const { parentId, name, schoolName, schoolId, class: className, age, allergies, preferences } = studentData;
    
    const result = await db.query(
      `INSERT INTO children (parent_id, name, school_name, school_id, class, age, allergies, preferences) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        parentId, 
        name, 
        schoolName, 
        schoolId || null, 
        className, 
        age || 8, 
        allergies || [], 
        preferences || []
      ]
    );
    
    // Update parent's children count
    await db.query(
      'UPDATE parents SET no_of_children = (SELECT COUNT(*) FROM children WHERE parent_id = $1) WHERE id = $1',
      [parentId]
    );
    
    return result.rows[0];
  }

  static async findByParentId(parentId) {
    const result = await db.query(
      'SELECT * FROM children WHERE parent_id = $1 ORDER BY created_at',
      [parentId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM children WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id, updateData) {
    const { name, schoolName, schoolId, class: className, age, allergies, preferences } = updateData;
    
    const result = await db.query(
      `UPDATE children 
       SET name = $1, school_name = $2, school_id = $3, class = $4, age = $5, allergies = $6, preferences = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, schoolName, schoolId, className, age, allergies || [], preferences || [], id]
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const child = await this.findById(id);
    if (!child) return false;
    
    await db.query('DELETE FROM children WHERE id = $1', [id]);
    
    // Update parent's children count
    await db.query(
      'UPDATE parents SET no_of_children = (SELECT COUNT(*) FROM children WHERE parent_id = $1) WHERE id = $1',
      [child.parent_id]
    );
    
    return true;
  }
}

module.exports = Student;