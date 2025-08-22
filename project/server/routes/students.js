const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.post('/', auth, roleAuth(['parent']), studentController.create);
router.get('/', auth, roleAuth(['parent']), studentController.listByParent);

module.exports = router;