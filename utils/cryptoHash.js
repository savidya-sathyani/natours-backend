const crypto = require('crypto');

exports.getRandomToken = (length) => crypto.randomBytes(length).toString('hex');

exports.getHashed = (data) =>
  crypto.createHash('sha256').update(data).digest('hex');
