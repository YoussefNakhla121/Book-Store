const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');


router.use('/v1/auth', authRoutes);
router.use('/v1/users', userRoutes);

module.exports = router;
