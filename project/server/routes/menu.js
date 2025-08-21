const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { validateRequest, schemas } = require('../middleware/validation');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Menu routes
router.post('/', auth, roleAuth(['caterer']), validateRequest(schemas.createMenuItem), menuController.createMenuItem);
router.get('/', auth, menuController.getMenuItems);
router.put('/:id', auth, roleAuth(['caterer']), menuController.updateMenuItem);
router.put('/:id/toggle', auth, roleAuth(['caterer']), menuController.toggleAvailability);
router.delete('/:id', auth, roleAuth(['caterer']), menuController.deleteMenuItem);

module.exports = router;