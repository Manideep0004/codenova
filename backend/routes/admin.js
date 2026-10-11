const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { validateBody, updateRoleSchema } = require('../middleware/validationMiddleware');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', validateBody(updateRoleSchema), adminController.updateUserRole);
router.get('/metrics', adminController.getSystemMetrics);

module.exports = router;
