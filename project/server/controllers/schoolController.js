const db = require('../config/database');

const schoolController = {
  async getTodayExpectedDeliveries(req, res) {
    try {
      const result = await db.query(
        `SELECT o.*, ds.name AS delivery_person_name
         FROM orders o
         LEFT JOIN delivery_staff ds ON o.delivery_staff_id = ds.id
         WHERE o.school_id = $1 AND o.order_date = CURRENT_DATE
         ORDER BY o.delivery_time`,
        [req.user.id]
      );
      res.json({ orders: result.rows });
    } catch (error) {
      console.error('School today deliveries error:', error);
      res.status(500).json({ error: 'Failed to fetch today expected deliveries' });
    }
  },

  async getAllDeliveries(req, res) {
    try {
      const result = await db.query(
        `SELECT o.*, ds.name AS delivery_person_name
         FROM orders o
         LEFT JOIN delivery_staff ds ON o.delivery_staff_id = ds.id
         WHERE o.school_id = $1
         ORDER BY o.order_date DESC, o.delivery_time DESC`,
        [req.user.id]
      );
      res.json({ orders: result.rows });
    } catch (error) {
      console.error('School all deliveries error:', error);
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  },

  async getClassSummary(req, res) {
    try {
      const result = await db.query(
        `SELECT o.class, 
                COUNT(*) FILTER (WHERE o.order_date = CURRENT_DATE) AS expected,
                COUNT(*) FILTER (WHERE o.order_date = CURRENT_DATE AND o.status = 'delivered') AS received,
                COUNT(*) FILTER (WHERE o.order_date = CURRENT_DATE AND o.status <> 'delivered') AS missing
         FROM (
           SELECT child_id, order_date, status, delivery_time, child_name, school_id,
                  (SELECT class FROM children c WHERE c.id = child_id) AS class
           FROM orders
           WHERE school_id = $1 AND order_date = CURRENT_DATE
         ) o
         GROUP BY o.class
         ORDER BY o.class`,
        [req.user.id]
      );
      res.json({ classes: result.rows });
    } catch (error) {
      console.error('School class summary error:', error);
      res.status(500).json({ error: 'Failed to fetch class summary' });
    }
  }
};

module.exports = schoolController;