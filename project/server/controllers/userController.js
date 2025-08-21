const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');

const userController = {
  async addChild(req, res) {
    try {
      const { name, schoolName, schoolId, class: className, age, allergies, preferences } = req.body;
      
      const childData = {
        parentId: req.user.id,
        name,
        schoolName,
        schoolId: schoolId || 'school-1', // Default school ID
        class: className,
        age: parseInt(age) || 8,
        allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
        preferences: preferences ? preferences.split(',').map(p => p.trim()) : []
      };
      
      const child = await Student.create(childData);
      
      // Create notification
      await Notification.create({
        userId: req.user.id,
        title: 'Child Added Successfully',
        message: `${name} has been added to your account.`,
        type: 'success'
      });
      
      res.status(201).json({
        message: 'Child added successfully',
        child
      });
    } catch (error) {
      console.error('Add child error:', error);
      res.status(500).json({ error: 'Failed to add child' });
    }
  },

  async getChildren(req, res) {
    try {
      const children = await Student.findByParentId(req.user.id);
      res.json({ children });
    } catch (error) {
      console.error('Get children error:', error);
      res.status(500).json({ error: 'Failed to get children' });
    }
  },

  async updateChild(req, res) {
    try {
      const { id } = req.params;
      const child = await Student.update(id, req.body);
      
      if (!child) {
        return res.status(404).json({ error: 'Child not found' });
      }
      
      res.json({
        message: 'Child updated successfully',
        child
      });
    } catch (error) {
      console.error('Update child error:', error);
      res.status(500).json({ error: 'Failed to update child' });
    }
  },

  async deleteChild(req, res) {
    try {
      const { id } = req.params;
      const success = await Student.delete(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Child not found' });
      }
      
      res.json({ message: 'Child deleted successfully' });
    } catch (error) {
      console.error('Delete child error:', error);
      res.status(500).json({ error: 'Failed to delete child' });
    }
  },

  async updateLoyaltyPoints(req, res) {
    try {
      const { points } = req.body;
      await User.updateLoyaltyPoints(req.user.id, points);
      
      res.json({ message: 'Loyalty points updated successfully' });
    } catch (error) {
      console.error('Update loyalty points error:', error);
      res.status(500).json({ error: 'Failed to update loyalty points' });
    }
  }
};

module.exports = userController;