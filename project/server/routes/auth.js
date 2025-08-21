const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest, schemas } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', validateRequest(schemas.register), authController.register);
router.post('/login', validateRequest(schemas.login), authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.post('/logout', auth, authController.logout);

module.exports = router;