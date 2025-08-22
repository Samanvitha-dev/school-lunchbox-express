const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.put('/availability', auth, roleAuth(['delivery']), deliveryController.toggleAvailability);
router.get('/today', auth, roleAuth(['delivery']), deliveryController.getTodayDeliveries);
router.get('/all', auth, roleAuth(['delivery']), deliveryController.getAllDeliveries);
router.get('/leaderboard', auth, roleAuth(['delivery','admin']), deliveryController.getLeaderboard);

module.exports = router;