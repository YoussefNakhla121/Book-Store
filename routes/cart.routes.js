const express = require('express');
const router  = express.Router();

const cartController = require('../controllers/cart.controller');
const { protect }    = require('../middlewares/auth.middleware');
const { validateAddItem, validateUpdateItem } = require('../validators/cart.validator');

// All cart routes require authentication
router.use(protect);

// GET    /api/v1/cart             — view own cart
router.get('/', cartController.getCart);

// POST   /api/v1/cart/items       — add item (or increase qty)
router.post('/items', validateAddItem, cartController.addItem);

// PUT    /api/v1/cart/items/:bookId — update item quantity
router.put('/items/:bookId', validateUpdateItem, cartController.updateItem);

// DELETE /api/v1/cart/items/:bookId — remove single item
router.delete('/items/:bookId', cartController.removeItem);

// DELETE /api/v1/cart             — clear entire cart
router.delete('/', cartController.clearCart);

module.exports = router;