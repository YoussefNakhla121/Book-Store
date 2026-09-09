
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler'); // استدعاء الأداة


exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: { user }
  });
});

exports.updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.role) {
    return res.status(400).json({
      success: false,
      message: 'This route is not for password or role updates.'
    });
  }

  const filteredBody = {};
  if (req.body.name) filteredBody.name = req.body.name;
  if (req.body.phone) filteredBody.phone = req.body.phone;
  if (req.body.address) filteredBody.address = req.body.address;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
});


exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password.'
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return res.status(401).json({
      success: false,
      message: 'Your current password is incorrect.'
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully.'
  });
});


exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).skip(skip).limit(limit);
  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: { users },
    meta: {
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  });
});


exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});


exports.updateUser = asyncHandler(async (req, res, next) => {
  const { role, isActive } = req.body;
  const updateData = {};

  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});


exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully.'
  });
});