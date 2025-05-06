const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Register and login routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', verifyToken, userController.getCurrentUser);
router.get('/:id', verifyToken, userController.getUserInfo);

module.exports = router;
