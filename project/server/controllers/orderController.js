const Order = require('../models/Order');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');

const orderController = {
  async createOrder(req, res) {
    try {
      const { childId, orderDate, deliveryTime, specialNotes, isRecurring, recurringDays, orderType, items, loyaltyPointsUsed } = req.body;
      
      // Get child details
      const child = await Student.findById(childId);
      if (!child) {
        return res.status(404).json({ error: 'Child not found' });
      }
      
      // Get parent details for pickup address
      const parent = await User.findById(req.user.id);
      if (!parent) {
        return res.status(404).json({ error: 'Parent not found' });
      }
      
      // Calculate amount
      let amount = 0;
      if (orderType === 'home') {
        amount = 80 + 15; // Food cost + delivery charge
      } else if (orderType === 'caterer' && items && items.length > 0) {
        amount = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0) + 15;
      } else {
        return res.status(400).json({ error: 'Invalid order type or missing items' });
      }
      
      // Apply loyalty discount
      const loyaltyDiscount = Math.min(loyaltyPointsUsed || 0, amount * 0.1);
      amount = Math.max(0, amount - loyaltyDiscount);
      
      const orderData = {
        parentId: req.user.id,
        childId,
        childName: child.name,
        schoolId: child.school_id,
        schoolName: child.school_name,
        pickupAddress: parent.address || 'Home Address',
        deliveryAddress: `${child.school_name} School`,
        orderDate,
        deliveryTime,
        specialNotes: specialNotes || '',
        isRecurring: isRecurring || false,
        recurringDays: recurringDays || [],
        amount,
        orderType,
        catererId: orderType === 'caterer' ? items[0]?.menuItem.catererId : null,
        items: orderType === 'caterer' ? items : [],
        loyaltyPointsUsed: loyaltyPointsUsed || 0
      };
      
      const order = await Order.create(orderData);
      
      // Notify all available delivery staff about new order
      const availableStaff = await User.getAvailableDeliveryStaff();
      
      for (const staff of availableStaff) {
        await Notification.create({
          userId: staff.id,
          title: 'New Order Available!',
          message: `New delivery order for ${child.name} at ${child.school_name}. Distance: ${order.distance_km?.toFixed(1)}km. Earnings: ₹${order.delivery_charge}`,
          type: 'order-update',
          orderId: order.id,
          actionRequired: true
        });
      }
      
      // Create notifications for parent
      await Notification.create({
        userId: req.user.id,
        title: 'Order Placed Successfully!',
        message: `Your order for ${child.name} has been placed. You earned ${Math.floor(amount / 10)} loyalty points!`,
        type: 'success',
        orderId: order.id
      });
      
      // Notify school about expected delivery
      if (child.school_id) {
        await Notification.create({
          userId: child.school_id,
          title: 'New Delivery Expected',
          message: `Lunchbox delivery expected for ${child.name} in ${child.class} at ${deliveryTime}`,
          type: 'info',
          orderId: order.id
        });
      }
      
      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: error.message || 'Failed to create order' });
    }
  },

  async reorderForWeekday(req, res) {
    try {
      const { orderId, weekday } = req.body; // weekday: 0-6 (Sun-Sat) or string
      const baseOrder = await Order.findById(orderId);
      if (!baseOrder) return res.status(404).json({ error: 'Order not found' });
      
      const dayIndex = typeof weekday === 'string' ? ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].indexOf(weekday.toLowerCase()) : weekday;
      if (dayIndex < 0 || dayIndex > 6) return res.status(400).json({ error: 'Invalid weekday' });
      
      const today = new Date(baseOrder.order_date);
      const month = today.getMonth();
      const year = today.getFullYear();
      const created = [];
      
      // Start from next day of base order
      const start = new Date(year, month, today.getDate() + 1);
      for (let d = new Date(start); d.getMonth() === month; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === dayIndex) {
          const iso = d.toISOString().slice(0, 10);
          const newOrder = await Order.createFromExisting(baseOrder, iso);
          created.push(newOrder);
        }
      }
      
      res.json({ message: 'Reorders created for remaining weekdays', count: created.length, orders: created });
    } catch (error) {
      console.error('Reorder weekday error:', error);
      res.status(500).json({ error: 'Failed to create reorders' });
    }
  },

  async getConfirmedDates(req, res) {
    try {
      const result = await Order.findByParentId(req.user.id);
      const confirmed = result
        .filter(o => ['accepted','picked','in-progress','delivered','ordered'].includes(o.status))
        .map(o => o.order_date);
      res.json({ dates: Array.from(new Set(confirmed)) });
    } catch (error) {
      console.error('Get confirmed dates error:', error);
      res.status(500).json({ error: 'Failed to fetch confirmed dates' });
    }
  },

  async getOrders(req, res) {
    try {
      let orders = [];
      
      switch (req.user.user_type) {
        case 'parent':
          orders = await Order.findByParentId(req.user.id);
          break;
        case 'delivery':
          orders = await Order.findByDeliveryStaffId(req.user.id);
          break;
        case 'school':
          orders = await Order.findBySchoolId(req.user.id);
          break;
        case 'caterer':
          orders = await Order.findByCatererId(req.user.id);
          break;
        case 'admin':
          orders = await Order.getAll();
          break;
        default:
          return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json({ orders });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  },

  async acceptOrder(req, res) {
    try {
      const { id } = req.params;
      
      if (req.user.user_type !== 'delivery') {
        return res.status(403).json({ error: 'Only delivery staff can accept orders' });
      }
      
      const order = await Order.updateStatus(id, 'accepted', req.user.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Notify parent about order acceptance
      await Notification.create({
        userId: order.parent_id,
        title: 'Order Accepted!',
        message: `Your order for ${order.child_name} has been accepted by delivery partner. Estimated delivery: ${order.delivery_time}`,
        type: 'order-update',
        orderId: order.id
      });
      
      res.json({
        message: 'Order accepted successfully',
        order
      });
    } catch (error) {
      console.error('Accept order error:', error);
      res.status(500).json({ error: 'Failed to accept order' });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const order = await Order.updateStatus(id, status, req.user.user_type === 'delivery' ? req.user.id : null);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Create status update notification for parent
      const statusMessages = {
        accepted: 'Your order has been accepted by the delivery partner',
        picked: 'Your lunchbox has been picked up',
        'in-progress': 'Your lunchbox is on the way to school',
        delivered: 'Your lunchbox has been delivered successfully'
      };
      
      if (statusMessages[status]) {
        await Notification.create({
          userId: order.parent_id,
          title: 'Order Status Update',
          message: statusMessages[status],
          type: 'order-update',
          orderId: order.id
        });
      }
      
      res.json({
        message: 'Order status updated successfully',
        order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },

  async getTodayOrders(req, res) {
    try {
      const orders = await Order.getTodayOrders();
      res.json({ orders });
    } catch (error) {
      console.error('Get today orders error:', error);
      res.status(500).json({ error: 'Failed to get today orders' });
    }
  },

  async getPendingOrders(req, res) {
    try {
      if (req.user.user_type !== 'delivery') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const orders = await Order.getPendingOrders();
      res.json({ orders });
    } catch (error) {
      console.error('Get pending orders error:', error);
      res.status(500).json({ error: 'Failed to get pending orders' });
    }
  }
};

module.exports = orderController;