const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { getHashed, getRandomToken } = require('../utils/cryptoHash');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    require: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    trim: true,
    require: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: {
      values: ['ADMIN', 'USER', 'GUIDE', 'LEAD_GUIDE'],
      message: 'Role can be either ADMIN, USER, GUIDE or LEAD_GUIDE',
    },
    default: 'USER',
  },
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    minlength: [8, 'Password must have more or equal than 10 characters'],
    select: false,
  },
  passwordConfirmed: {
    type: String,
    require: [true, 'Please confirm your password'],
    validate: {
      // Only works on save | create. When updating this will not triggered
      validator: function (v) {
        return v === this.password;
      },
      message: 'Confirmed password must be same as your password',
    },
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirmed = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Subtract 1 second in case the token creation got delayed a bit
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// An instance method
userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  actualPassword
) {
  return await bcrypt.compare(candidatePassword, actualPassword);
};

userSchema.methods.isPasswordChangedAfterLogin = async function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const convertedPasswordChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < convertedPasswordChangedTime;
  }

  // return false when Not changed
  return false;
};

userSchema.methods.getPasswordResetToken = function () {
  const resetToken = getRandomToken(32);
  this.passwordResetToken = getHashed(resetToken);
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
