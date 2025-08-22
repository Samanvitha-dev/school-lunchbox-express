const db = require('../config/database');

const deliveryController = {
  async toggleAvailability(req, res) {
    try {
      const { status } = req.body; // 'available' | 'busy' | 'offline'
      if (!['available', 'busy', 'offline'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      await db.query('UPDATE delivery_staff SET current_status = $1 WHERE id = $2', [status, req.user.id]);
      res.json({ message: 'Status updated', status });
    } catch (error) {
      console.error('Toggle availability error:', error);
      res.status(500).json({ error: 'Failed to update availability' });
    }
  },

  async getTodayDeliveries(req, res) {
    try {
      const result = await db.query(
        `SELECT * FROM orders WHERE delivery_staff_id = $1 AND order_date = CURRENT_DATE ORDER BY delivery_time`,
        [req.user.id]
      );
      res.json({ orders: result.rows });
    } catch (error) {
      console.error('Get today deliveries error:', error);
      res.status(500).json({ error: 'Failed to fetch today deliveries' });
    }
  },

  async getAllDeliveries(req, res) {
    try {
      const result = await db.query(
        `SELECT * FROM orders WHERE delivery_staff_id = $1 ORDER BY order_date DESC, delivery_time DESC`,
        [req.user.id]
      );
      res.json({ orders: result.rows });
    } catch (error) {
      console.error('Get all deliveries error:', error);
      res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
  },

  async getLeaderboard(req, res) {
    try {
      // Compute current month top performers by number of delivered orders
      const result = await db.query(
        `SELECT ds.id, ds.name AS duplicate_name,
                COUNT(o.id) FILTER (WHERE o.status = 'delivered' AND date_trunc('month', o.order_date) = date_trunc('month', CURRENT_DATE)) AS deliveries_completed,
                ROUND(AVG(EXTRACT(EPOCH FROM (o.actual_delivery_time - o.pickup_time))/60)::numeric, 1) AS avg_delivery_time,
                4.7 AS rating
         FROM delivery_staff ds
         LEFT JOIN orders o ON ds.id = o.delivery_staff_id
         GROUP BY ds.id, ds.name
         ORDER BY deliveries_completed DESC NULLS LAST
         LIMIT 10`);

      const leaderboard = result.rows.map((row, index) => ({
        rank: index + 1,
        name: row.duplicate_name,
        deliveries_completed: Number(row.deliveries_completed || 0),
        avg_delivery_time: Number(row.avg_delivery_time || 0),
        rating: Number(row.rating || 0)
      }));

      // Rewards for top 3
      const rewards = [
        'Smartphone or ₹10,000 voucher',
        'Smartwatch or ₹5,000 voucher',
        'Bluetooth headphones or ₹2,500 voucher'
      ];

      leaderboard.forEach((row) => {
        if (row.rank <= 3) {
          row.reward = rewards[row.rank - 1];
        }
      });

      res.json({ leaderboard });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
};

module.exports = deliveryController;