const Order = require('../models/Order');
const Cart  = require('../models/Cart');
const Book  = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// ── POST /api/v1/orders ─────────────────────────────────────────────────────
// Checkout: convert the user's cart into an order
exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  // Load user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Your cart is empty — nothing to checkout',
    });
  }

  // Validate stock and snapshot prices
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const book = item.book;
    if (!book) {
      return res.status(400).json({
        success: false,
        message: 'One or more cart items reference a deleted book',
      });
    }
    if (book.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `"${book.title}" only has ${book.stock} unit(s) in stock`,
      });
    }
    const unitPrice = book.discountPrice ?? book.price;
    orderItems.push({ book: book._id, quantity: item.quantity, price: unitPrice });
    totalAmount += unitPrice * item.quantity;
  }

  // Decrement stock for each purchased book
  const stockUpdates = cart.items.map((item) =>
    Book.findByIdAndUpdate(item.book._id, {
      $inc: { stock: -item.quantity },
    })
  );
  await Promise.all(stockUpdates);

  // Create the order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount: Math.round(totalAmount * 100) / 100,
    shippingAddress,
  });

  // Clear the cart after successful checkout
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order },
  });
});

// ── GET /api/v1/orders/my ───────────────────────────────────────────────────
// Get the authenticated user's order history (paginated)
exports.getMyOrders = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page, 10)  || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip  = (page - 1) * limit;

  const query = { user: req.user._id };

  const [orders, totalItems] = await Promise.all([
    Order.find(query)
      .populate('items.book', 'title author images')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: 'Orders retrieved successfully',
    data: { orders },
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  });
});

// ── GET /api/v1/orders/:id ──────────────────────────────────────────────────
// Get a single order — users can only view their own; admins can view any
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'items.book',
    'title author images'
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Non-admin users can only see their own orders
  if (
    req.user.role !== 'admin' &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.status(200).json({
    success: true,
    message: 'Order retrieved successfully',
    data: { order },
  });
});

// ── PATCH /api/v1/orders/:id/cancel ────────────────────────────────────────
// Cancel own pending order (only 'pending' orders are cancellable by users)
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.book');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  if (order.orderStatus !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel an order with status "${order.orderStatus}"`,
    });
  }

  // Restore stock
  const stockRestores = order.items.map((item) =>
    Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity } })
  );
  await Promise.all(stockRestores);

  order.orderStatus = 'cancelled';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order },
  });
});

// ── GET /api/v1/orders  [Admin] ─────────────────────────────────────────────
// List all orders — filterable by orderStatus, paginated
exports.getAllOrders = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page, 10)  || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  const [orders, totalItems] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .populate('items.book', 'title author')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'All orders retrieved',
    data: { orders },
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  });
});

// ── PATCH /api/v1/orders/:id/status  [Admin] ────────────────────────────────
// Update order status (admin only)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },
    { new: true, runValidators: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to "${orderStatus}"`,
    data: { order },
  });
});
