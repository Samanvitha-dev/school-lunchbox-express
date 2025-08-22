const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRequest, schemas } = require('../middleware/validation');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Parent routes
router.post('/children', auth, roleAuth(['parent']), validateRequest(schemas.addChild), userController.addChild);
router.get('/children', auth, roleAuth(['parent']), userController.getChildren);
router.put('/children/:id', auth, roleAuth(['parent']), userController.updateChild);
router.delete('/children/:id', auth, roleAuth(['parent']), userController.deleteChild);
router.put('/loyalty-points', auth, roleAuth(['parent']), userController.updateLoyaltyPoints);

// Admin routes
router.get('/stats', auth, roleAuth(['admin']), userController.getUserStats);

module.exports = router;