const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'refreshSecret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email is already registered.'
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role
  });

  const tokens = generateTokens(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    }
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password.'
    });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account is deactivated.'
    });
  }

  const tokens = generateTokens(user._id);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    }
  });
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required.'
    });
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || 'refreshSecret'
  );

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token.'
    });
  }

  const tokens = generateTokens(user._id);

  res.status(200).json({
    success: true,
    data: tokens
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});