const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');

const app = express();

// Middleware
// The order that we defines middleware is matters.
app.use(morgan('dev')); // Logger
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // next() is a must code otherwise the request will get stuck in the middle
});
app.use(express.json()); // In order to access the data in the request body

// Mounting routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
