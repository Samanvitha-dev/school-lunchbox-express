const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateRequest, schemas } = require('../middleware/validation');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Order routes
router.post('/', auth, roleAuth(['parent']), validateRequest(schemas.createOrder), orderController.createOrder);
router.get('/', auth, orderController.getOrders);
router.get('/pending', auth, roleAuth(['delivery']), orderController.getPendingOrders);
router.put('/:id/accept', auth, roleAuth(['delivery']), orderController.acceptOrder);
router.put('/:id/status', auth, roleAuth(['delivery', 'admin']), orderController.updateOrderStatus);
router.get('/today', auth, roleAuth(['admin', 'school', 'delivery']), orderController.getTodayOrders);

module.exports = router;