const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.get('/today', auth, roleAuth(['school']), schoolController.getTodayExpectedDeliveries);
router.get('/all', auth, roleAuth(['school']), schoolController.getAllDeliveries);
router.get('/class-summary', auth, roleAuth(['school']), schoolController.getClassSummary);

module.exports = router;