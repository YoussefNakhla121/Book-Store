const express = require('express');
const router  = express.Router({ mergeParams: true }); // mergeParams for /books/:bookId/reviews

const reviewController = require('../controllers/review.controller');
const { protect }      = require('../middlewares/auth.middleware');
const { validateCreateReview, validateUpdateReview } = require('../validators/review.validator');

// ── Nested under /reviews/:bookId ─────────────────────────────────────────────

// GET  /api/v1/reviews/:bookId  — list reviews for a book (public)
router.get('/:bookId', reviewController.getBookReviews);

// POST /api/v1/reviews/:bookId  — add a review (authenticated)
router.post('/:bookId', protect, validateCreateReview, reviewController.addReview);

// PUT    /api/v1/reviews/:id — edit own review (authenticated)
router.put('/:id', protect, validateUpdateReview, reviewController.updateReview);

// DELETE /api/v1/reviews/:id — delete a review (owner or admin)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;