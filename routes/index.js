const express = require('express');
const router = express.Router();

// Each file below is a per-module router (owned by the developer for that module).
// They are currently empty stubs — this index only wires up where they mount.
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const bookRoutes = require('./book.routes');
const categoryRoutes = require('./category.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const wishlistRoutes = require('./wishlist.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/admin', adminRoutes);

module.exports = router;


