const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const Notification = require('../models/Notification');

const authController = {
  async register(req, res) {
    try {
      console.log('Registration request:', req.body);
      
      const userId = await User.create(req.body);
      
      // Create welcome notification
      await Notification.create({
        userId,
        title: 'Welcome to LunchBox Express!',
        message: `Welcome ${req.body.username}! Your account has been created successfully.`,
        type: 'success'
      });
      
      const token = generateToken({ id: userId, userType: req.body.userType });
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: userId, username: req.body.username, userType: req.body.userType }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findByCredentials(username, password);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      await User.updateLastLogin(user.id);
      
      const token = generateToken({ id: user.id, userType: user.user_type });
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.user_type,
          isFirstLogin: user.is_first_login,
          doorNo: user.door_no,
          address: user.address,
          ...user
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  async logout(req, res) {
    res.json({ message: 'Logout successful' });
  }
};

module.exports = authController;