const express = require('express');
const router  = express.Router();

// ── Developer 1 routes ──────────────────────────────────────────────────────
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// ── Developer 3 routes ──────────────────────────────────────────────────────
const cartRoutes  = require('./cart.routes');
const orderRoutes = require('./order.routes');

// ── Developer 4 routes ──────────────────────────────────────────────────────
const reviewRoutes   = require('./review.routes');   // nested + standalone
const wishlistRoutes = require('./wishlist.routes');

// ── Standalone review controller (for PUT /reviews/:id and DELETE /reviews/:id)
const reviewController = require('../controllers/review.controller');
const { protect }      = require('../middlewares/auth.middleware');
const { validateUpdateReview } = require('../validators/review.validator');

// ── Mount routes ────────────────────────────────────────────────────────────

router.use('/v1/auth',     authRoutes);
router.use('/v1/users',    userRoutes);

router.use('/v1/cart',     cartRoutes);
router.use('/v1/orders',   orderRoutes);

// Nested review routes: GET + POST /books/:bookId/reviews
router.use('/v1/books/:bookId/reviews', reviewRoutes);

// Standalone review routes: PUT + DELETE /reviews/:id
router.put('/v1/reviews/:id',    protect, validateUpdateReview, reviewController.updateReview);
router.delete('/v1/reviews/:id', protect, reviewController.deleteReview);

router.use('/v1/wishlist', wishlistRoutes);

module.exports = router;
