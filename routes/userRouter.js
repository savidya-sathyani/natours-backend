const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
  '/update-password/:id',
  authController.protect,
  authController.updatePassword
);

router.route('/').get(userController.getAllUsers).post(userController.addUser);
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('ADMIN'),
    userController.deleteUser
  );

module.exports = router;
