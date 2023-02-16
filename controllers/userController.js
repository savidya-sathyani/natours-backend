const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const featuresAdded = new APIFeatures(User.find(), req.query).filterFields();
  const users = await featuresAdded.query;
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!!',
  });
};

exports.getUserById = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!!',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!!',
  });
};

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with this ID.', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
