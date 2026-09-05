const Wishlist = require('../models/Wishlist');
const Book     = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// ── GET /api/v1/wishlist ────────────────────────────────────────────────────
// View the authenticated user's wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    'books',
    'title author price discountPrice images averageRating numReviews stock'
  );

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, books: [] });
  }

  res.status(200).json({
    success: true,
    message: 'Wishlist retrieved successfully',
    data: { wishlist },
  });
});

// ── POST /api/v1/wishlist/items ─────────────────────────────────────────────
// Add a book to the wishlist (idempotent — duplicates silently ignored)
exports.addBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  // Confirm book exists
  const book = await Book.findById(bookId).select('_id');
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, books: [] });
  }

  const alreadySaved = wishlist.books.some(
    (id) => id.toString() === bookId
  );

  if (!alreadySaved) {
    wishlist.books.push(bookId);
    await wishlist.save();
  }

  await wishlist.populate(
    'books',
    'title author price discountPrice images averageRating numReviews stock'
  );

  res.status(200).json({
    success: true,
    message: alreadySaved ? 'Book already in wishlist' : 'Book added to wishlist',
    data: { wishlist },
  });
});

// ── DELETE /api/v1/wishlist/items/:bookId ───────────────────────────────────
// Remove a book from the wishlist
exports.removeBook = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    return res
      .status(404)
      .json({ success: false, message: 'Wishlist not found' });
  }

  const itemIndex = wishlist.books.findIndex(
    (id) => id.toString() === bookId
  );

  if (itemIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: 'Book not found in wishlist' });
  }

  wishlist.books.splice(itemIndex, 1);
  await wishlist.save();

  await wishlist.populate(
    'books',
    'title author price discountPrice images averageRating numReviews stock'
  );

  res.status(200).json({
    success: true,
    message: 'Book removed from wishlist',
    data: { wishlist },
  });
});
