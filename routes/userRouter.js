const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);

// User Routes
router.patch('/update', authController.protect, userController.updateUser);
router.delete('/delete', authController.protect, userController.deleteUser);

// Admin Routes
router.patch(
  '/:id/role',
  authController.protect,
  authController.restrictTo('ADMIN'),
  adminController.updateUserRole
);

router.route('/').get(userController.getAllUsers).post(userController.addUser);
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(authController.protect, userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('ADMIN'),
    userController.deleteUser
  );

module.exports = router;
