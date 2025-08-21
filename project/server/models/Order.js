const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { calculateDistance, calculateDeliveryCharge, getCoordinatesFromDoorNumber } = require('../utils/locationHelper');

class Order {
  static async create(orderData) {
    const {
      parentId, childId, childName, schoolId, schoolName,
      pickupAddress, deliveryAddress, orderDate, deliveryTime,
      specialNotes, isRecurring, recurringDays, amount,
      orderType, catererId, items, loyaltyPointsUsed
    } = orderData;

    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get parent and school door numbers
      const parentResult = await client.query('SELECT door_no FROM users WHERE id = $1', [parentId]);
      const schoolResult = await client.query('SELECT door_no FROM users WHERE id = $1', [schoolId]);
      
      const pickupDoorNo = parentResult.rows[0]?.door_no || 'H101';
      const deliveryDoorNo = schoolResult.rows[0]?.door_no || 'S101';
      
      // Calculate distance and delivery charge
      const pickupCoords = getCoordinatesFromDoorNumber(pickupDoorNo);
      const deliveryCoords = getCoordinatesFromDoorNumber(deliveryDoorNo);
      
      const distance = calculateDistance(
        pickupCoords.latitude, pickupCoords.longitude,
        deliveryCoords.latitude, deliveryCoords.longitude
      );
      
      const deliveryCharge = calculateDeliveryCharge(distance);
      
      const qrCode = `LB${Date.now()}-${childName.toUpperCase().replace(/\s+/g, '')}`;
      const loyaltyPointsEarned = Math.floor(amount / 10);
      
      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          parent_id, child_id, child_name, school_id, school_name,
          pickup_address, delivery_address, pickup_door_no, delivery_door_no,
          order_date, delivery_time, special_notes, is_recurring, recurring_days, 
          amount, delivery_charge, distance_km, qr_code, estimated_time, order_type, 
          caterer_id, loyalty_points_earned, loyalty_points_used
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *`,
        [
          parentId, childId, childName, schoolId, schoolName,
          pickupAddress, deliveryAddress, pickupDoorNo, deliveryDoorNo,
          orderDate, deliveryTime, specialNotes, isRecurring, recurringDays || [],
          amount, deliveryCharge, distance, qrCode, 25, orderType,
          catererId, loyaltyPointsEarned, loyaltyPointsUsed || 0
        ]
      );
      
      const orderId = orderResult.rows[0].id;
      
      // Add order items if caterer order
      if (orderType === 'caterer' && items && items.length > 0) {
        for (const item of items) {
          await client.query(
            `INSERT INTO order_items (order_id, menu_item_id, quantity, price, special_instructions)
             VALUES ($1, $2, $3, $4, $5)`,
            [orderId, item.menuItem.id, item.quantity, item.menuItem.price, item.specialInstructions || null]
          );
        }
      }
      
      // Update parent loyalty points
      const pointsChange = loyaltyPointsEarned - (loyaltyPointsUsed || 0);
      await client.query(
        'UPDATE parents SET loyalty_points = loyalty_points + $1 WHERE id = $2',
        [pointsChange, parentId]
      );
      
      await client.query('COMMIT');
      return orderResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByParentId(parentId) {
    const result = await db.query(
      `SELECT o.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'menuItem', json_build_object(
               'id', mi.id,
               'name', mi.name,
               'price', mi.price,
               'catererId', mi.caterer_id
             ),
             'quantity', oi.quantity,
             'specialInstructions', oi.special_instructions
           )
         ) FILTER (WHERE oi.id IS NOT NULL), 
         '[]'
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.parent_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [parentId]
    );
    return result.rows;
  }

  static async findByDeliveryStaffId(deliveryStaffId) {
    const result = await db.query(
      'SELECT * FROM orders WHERE delivery_staff_id = $1 ORDER BY order_date DESC, delivery_time',
      [deliveryStaffId]
    );
    return result.rows;
  }

  static async findBySchoolId(schoolId) {
    const result = await db.query(
      'SELECT * FROM orders WHERE school_id = $1 ORDER BY order_date DESC, delivery_time',
      [schoolId]
    );
    return result.rows;
  }

  static async findByCatererId(catererId) {
    const result = await db.query(
      `SELECT o.*, 
       COALESCE(
         json_agg(
           json_build_object(
             'menuItem', json_build_object(
               'id', mi.id,
               'name', mi.name,
               'price', mi.price
             ),
             'quantity', oi.quantity
           )
         ) FILTER (WHERE oi.id IS NOT NULL), 
         '[]'
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.caterer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [catererId]
    );
    return result.rows;
  }

  static async updateStatus(orderId, status, deliveryStaffId = null) {
    let query = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP';
    let params = [status, orderId];
    
    if (status === 'delivered') {
      query += ', actual_delivery_time = CURRENT_TIMESTAMP';
    }
    
    if (deliveryStaffId && status === 'accepted') {
      query += ', delivery_staff_id = $3';
      params = [status, orderId, deliveryStaffId];
      
      // Update delivery staff status to busy
      await db.query(
        'UPDATE delivery_staff SET current_status = $1 WHERE id = $2',
        ['busy', deliveryStaffId]
      );
    }
    
    if (status === 'delivered' && deliveryStaffId) {
      // Update delivery staff status back to available and add earnings
      const orderResult = await db.query('SELECT delivery_charge FROM orders WHERE id = $1', [orderId]);
      const earnings = orderResult.rows[0]?.delivery_charge || 15;
      
      await db.query(
        'UPDATE delivery_staff SET current_status = $1, total_deliveries = total_deliveries + 1, total_earnings = total_earnings + $2 WHERE id = $3',
        ['available', earnings, deliveryStaffId]
      );
    }
    
    query += ' WHERE id = $2 RETURNING *';
    
    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getAll() {
    const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows;
  }

  static async getTodayOrders() {
    const result = await db.query(
      'SELECT * FROM orders WHERE order_date = CURRENT_DATE ORDER BY delivery_time'
    );
    return result.rows;
  }

  static async getPendingOrders() {
    const result = await db.query(
      "SELECT * FROM orders WHERE status = 'ordered' ORDER BY created_at ASC"
    );
    return result.rows;
  }
}

module.exports = Order;