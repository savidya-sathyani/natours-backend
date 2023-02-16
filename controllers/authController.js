const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { signJWT, validateToken } = require('../utils/jwt');

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmed: req.body.passwordConfirmed,
  });

  const token = signJWT(user._id);

  if (user) {
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide valid credentials.', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isCorrectPassword(password, user.password)))
    return next(new AppError('Invalid credentials.', 401));

  const token = signJWT(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if the token is valid
  if (!token)
    return next(
      new AppError('Token Invalid. Please login again to get access.', 401)
    );

  const decoded = await validateToken(token);

  // Check if the token is belongs to a valid user
  const user = await User.findById(decoded.id);
  if (!user)
    return next(new AppError("User of this token doesn't exist.", 401));

  // Check if the user has changed the password after issuing the JWT
  if (await user.isPasswordChangedAfterLogin(decoded.iat))
    return next(
      new AppError(
        'User recently changed the password. Please login again.',
        401
      )
    );

  // Grant access for the protected route
  req.user = user;
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('Permission Denied!', 403));
    next();
  });
