const Student = require('../models/Student');

const studentController = {
  async create(req, res) {
    try {
      const child = await Student.create({ parentId: req.user.id, ...req.body });
      res.status(201).json({ child });
    } catch (error) {
      console.error('Create student error:', error);
      res.status(500).json({ error: 'Failed to create student' });
    }
  },

  async listByParent(req, res) {
    try {
      const children = await Student.findByParentId(req.user.id);
      res.json({ children });
    } catch (error) {
      console.error('List students error:', error);
      res.status(500).json({ error: 'Failed to fetch children' });
    }
  }
};

module.exports = studentController;