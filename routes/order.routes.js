const express = require('express');
const router  = express.Router();

const orderController = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validateCheckout, validateUpdateOrderStatus } = require('../validators/order.validator');

// ── User endpoints (authenticated) ─────────────────────────────────────────

// POST   /api/v1/orders           — checkout / create order from cart
router.post('/', protect, validateCheckout, orderController.createOrder);

// GET    /api/v1/orders/my        — own order history, paginated
// Must be declared BEFORE /:id to avoid "my" being treated as a Mongo ObjectId
router.get('/my', protect, orderController.getMyOrders);

// GET    /api/v1/orders/:id       — view one order (own or any if admin)
router.get('/:id', protect, orderController.getOrder);

// PATCH  /api/v1/orders/:id/cancel — cancel own pending order
router.patch('/:id/cancel', protect, orderController.cancelOrder);

// ── Admin endpoints ─────────────────────────────────────────────────────────

// GET    /api/v1/orders           — list all orders (filterable by status)
router.get('/', protect, restrictTo('admin'), orderController.getAllOrders);

// PATCH  /api/v1/orders/:id/status — update order status
router.patch(
  '/:id/status',
  protect,
  restrictTo('admin'),
  validateUpdateOrderStatus,
  orderController.updateOrderStatus
);

module.exports = router;