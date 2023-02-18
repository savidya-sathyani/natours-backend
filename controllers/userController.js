const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (object, ...fields) => {
  const filteredObject = {};
  Object.keys(object).forEach((item) => {
    if (fields.includes(item)) {
      filteredObject[item] = object[item];
    }
  });
  return filteredObject;
};

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

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirmed)
    return next(
      new AppError(
        'Cannot update password here. Please use update password route.',
        400
      )
    );

  const filteredBody = filterObj(req.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with this ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  if (!user) {
    return next(new AppError('No user found with this ID.', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
