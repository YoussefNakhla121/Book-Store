const Review = require('../models/Review');
const Book   = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// ── GET /api/v1/books/:bookId/reviews ──────────────────────────────────────
// List paginated reviews for a specific book (public)
exports.getBookReviews = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const page  = parseInt(req.query.page, 10)  || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip  = (page - 1) * limit;

  // Confirm the book exists
  const book = await Book.findById(bookId).select('_id title');
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  const [reviews, totalItems] = await Promise.all([
    Review.find({ book: bookId })
      .populate('user', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ book: bookId }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Reviews retrieved successfully',
    data: { reviews },
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  });
});

// ── POST /api/v1/books/:bookId/reviews ─────────────────────────────────────
// Add a review (one per user per book — enforced by compound unique index)
exports.addReview = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;

  // Confirm book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  try {
    const review = await Review.create({
      book: bookId,
      user: req.user._id,
      rating,
      comment,
    });

    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { review },
    });
  } catch (err) {
    // Duplicate key error — user already reviewed this book
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this book',
      });
    }
    throw err;
  }
});

// ── PUT /api/v1/reviews/:id ─────────────────────────────────────────────────
// Edit own review
exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit your own reviews',
    });
  }

  const { rating, comment } = req.body;
  if (rating  !== undefined) review.rating  = rating;
  if (comment !== undefined) review.comment = comment;

  await review.save(); // post('save') hook will trigger rating rollup
  await review.populate('user', 'name');

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: { review },
  });
});

// ── DELETE /api/v1/reviews/:id ──────────────────────────────────────────────
// Delete a review — owner or admin
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this review',
    });
  }

  // findOneAndDelete triggers the post('findOneAndDelete') rollup hook
  await Review.findOneAndDelete({ _id: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});
