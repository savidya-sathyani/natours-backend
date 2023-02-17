const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { getHashed } = require('../utils/cryptoHash');
const sendEmail = require('../utils/emails');
const { signJWT, validateToken } = require('../utils/jwt');

const createAndSendToken = (user, statusCode, res) => {
  const token = signJWT(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmed: req.body.passwordConfirmed,
  });

  createAndSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide valid credentials.', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isCorrectPassword(password, user.password)))
    return next(new AppError('Invalid credentials.', 401));

  createAndSendToken(user, 200, res);
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
    return next(new AppError(`User of this token doesn't exist.`, 401));

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

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('Permission Denied!', 403));
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError('No user registered with this email. Please signup.', 404)
    );

  const resetToken = user.getPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/reset-password/${resetToken}`;

  const message = `Forgot your password? Please submit a patch request to this link: ${resetURL} with your password and confirmed password to reset your password.\nIf you didn't request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid only for 10 mins)',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Failed email sending.', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Password reset email sent successfully',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const passwordResetToken = getHashed(token);
  const user = await User.findOne({
    passwordResetToken,
    passwordResetTokenExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(
      new AppError(
        'Token expired. Please initiated the forgot password flow again',
        400
      )
    );

  const { password, passwordConfirmed } = req.body;
  user.password = password;
  user.passwordConfirmed = passwordConfirmed;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;
  await user.save();

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select('+password');
  if (!user) return next(new AppError('User not found', 404));

  const { currentPassword, newPassword, newPasswordConfirmed } = req.body;
  if (!(await user.isCorrectPassword(currentPassword, user.password)))
    return next(
      new AppError(
        'Current password is invalid. Please provide the correct current password.',
        401
      )
    );

  user.password = newPassword;
  user.passwordConfirmed = newPasswordConfirmed;
  await user.save();

  createAndSendToken(user, 200, res);
});
