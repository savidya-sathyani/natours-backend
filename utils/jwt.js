const { promisify } = require('util');
const jwt = require('jsonwebtoken');

exports.signJWT = (id) => {
  console.log(id);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.validateToken = async (token) =>
  await promisify(jwt.verify)(token, process.env.JWT_SECRET);
