const AppError = require('../utils/appError');

const handleDBCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDBDuplicateKeyError = (err) => {
  const duplicatingFieldValue = JSON.stringify(err.keyValue).match(/(".*?")/g);
  const message = `Duplicate ${duplicatingFieldValue[0]}: ${duplicatingFieldValue[1]}. Please use another value.`;
  return new AppError(message, 400);
};

const handleDBValidationError = (err) => {
  const errors = Object.values(err.errors).map((item) => item.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTInvalidError = () =>
  new AppError('Invalid token. Please login again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Token has expired. Please login again.', 401);

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  // Operational trusted errors
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown errors: Don't leak error details
  } else {
    // Log the error for developer
    console.error(`ERROR::: ${err}`);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (error.name === 'CastError') error = handleDBCastError(error);
    if (error.code === 11000) error = handleDBDuplicateKeyError(error);
    if (error.name === 'ValidationError')
      error = handleDBValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTInvalidError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorForProd(error, res);
  }
};
