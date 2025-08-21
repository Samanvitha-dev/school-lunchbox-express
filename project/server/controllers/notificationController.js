const Notification = require('../models/Notification');

const notificationController = {
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.findByUserId(req.user.id);
      res.json({ notifications });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  },

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.markAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      res.json({
        message: 'Notification marked as read',
        notification
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  },

  async markAllAsRead(req, res) {
    try {
      await Notification.markAllAsRead(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const count = await Notification.getUnreadCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }
};

module.exports = notificationController;