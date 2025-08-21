const db = require('../config/database');

class Notification {
  static async create(notificationData) {
    const { userId, title, message, type, orderId, actionRequired } = notificationData;
    
    const result = await db.query(
      `INSERT INTO notifications (user_id, title, message, type, order_id, action_required)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, message, type, orderId || null, actionRequired || false]
    );
    
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async markAsRead(id) {
    const result = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async markAllAsRead(userId) {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return true;
  }

  static async getUnreadCount(userId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  static async delete(id) {
    await db.query('DELETE FROM notifications WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Notification;