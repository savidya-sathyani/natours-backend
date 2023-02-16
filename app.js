const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');

const app = express();

// Middleware
// The order that we defines middleware is matters.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logger
}
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // next() is a must code otherwise the request will get stuck in the middle
});
app.use(express.json()); // In order to access the data in the request body

// Mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//handle unknown routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
