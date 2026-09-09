const Cart = require('../models/Cart');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// ── GET /api/v1/cart ────────────────────────────────────────────────────────
// View the authenticated user's cart (creates an empty one if it doesn't exist)
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.book',
    'title author price discountPrice images stock'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({
    success: true,
    message: 'Cart retrieved successfully',
    data: { cart },
  });
});

// ── POST /api/v1/cart/items ─────────────────────────────────────────────────
// Add a book to the cart (or increase quantity if already present)
exports.addItem = asyncHandler(async (req, res) => {
  const { bookId, quantity = 1 } = req.body;

  // Verify the book exists and has enough stock
  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }
  if (book.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${book.stock} unit(s) in stock`,
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Check if the item is already in the cart
  const existingIndex = cart.items.findIndex(
    (item) => item.book.toString() === bookId
  );

  if (existingIndex !== -1) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    if (newQty > book.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${quantity} more — only ${book.stock} unit(s) in stock`,
      });
    }
    cart.items[existingIndex].quantity = newQty;
  } else {
    cart.items.push({ book: bookId, quantity });
  }

  await cart.save();
  await cart.populate('items.book', 'title author price discountPrice images stock');

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: { cart },
  });
});

// ── PUT /api/v1/cart/items/:bookId ──────────────────────────────────────────
// Update the quantity of an item already in the cart
exports.updateItem = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.book.toString() === bookId
  );

  if (itemIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: 'Item not found in cart' });
  }

  // Stock check
  const book = await Book.findById(bookId).select('stock');
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }
  if (quantity > book.stock) {
    return res.status(400).json({
      success: false,
      message: `Only ${book.stock} unit(s) in stock`,
    });
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate('items.book', 'title author price discountPrice images stock');

  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    data: { cart },
  });
});

// ── DELETE /api/v1/cart/items/:bookId ───────────────────────────────────────
// Remove a single item from the cart
exports.removeItem = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.book.toString() === bookId
  );

  if (itemIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: 'Item not found in cart' });
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  await cart.populate('items.book', 'title author price discountPrice images stock');

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: { cart },
  });
});

// ── DELETE /api/v1/cart ─────────────────────────────────────────────────────
// Clear the entire cart
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: { cart },
  });
});
