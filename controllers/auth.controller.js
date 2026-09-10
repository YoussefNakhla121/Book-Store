const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');


// Generate Access Token and Refresh Token
const generateTokens = (userId) => {

  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'refreshSecret',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );

  return {
    accessToken,
    refreshToken
  };
};


// ==================== REGISTER ====================

exports.register = asyncHandler(async (req, res, next) => {

  const {
    name,
    email,
    password,
    phone
  } = req.body;


  // Check if email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {

    return res.status(400).json({
      success: false,
      message: 'Email is already registered.'
    });

  }


  // Create new user
  // Role is always user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'user'
  });


  // Generate tokens
  const tokens = generateTokens(user._id);


  // Response
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


// ==================== LOGIN ====================

exports.login = asyncHandler(async (req, res, next) => {

  const {
    email,
    password
  } = req.body;


  // Check email and password
  if (!email || !password) {

    return res.status(400).json({
      success: false,
      message: 'Please provide email and password.'
    });

  }


  // Find user
  const user = await User
    .findOne({ email })
    .select('+password');


  // Check user and password
  if (
    !user ||
    !(await user.correctPassword(
      password,
      user.password
    ))
  ) {

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });

  }


  // Check account status
  if (!user.isActive) {

    return res.status(403).json({
      success: false,
      message: 'Your account is deactivated.'
    });

  }


  // Generate tokens
  const tokens = generateTokens(user._id);


  // Response
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


// ==================== REFRESH TOKEN ====================

exports.refreshToken = asyncHandler(async (req, res, next) => {

  const {
    refreshToken
  } = req.body;


  // Check refresh token
  if (!refreshToken) {

    return res.status(400).json({
      success: false,
      message: 'Refresh token is required.'
    });

  }


  // Verify refresh token
  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET || 'refreshSecret'
  );


  // Find user
  const user = await User.findById(decoded.id);


  if (!user) {

    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token.'
    });

  }


  // Generate new tokens
  const tokens = generateTokens(user._id);


  res.status(200).json({

    success: true,

    data: tokens

  });

});


// ==================== LOGOUT ====================

exports.logout = asyncHandler(async (req, res, next) => {

  res.status(200).json({

    success: true,

    message: 'Logged out successfully'

  });

});