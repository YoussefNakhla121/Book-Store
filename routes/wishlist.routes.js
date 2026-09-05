const express = require('express');
const router  = express.Router();

const wishlistController = require('../controllers/wishlist.controller');
const { protect }        = require('../middlewares/auth.middleware');
const { validateAddBook } = require('../validators/wishlist.validator');

// All wishlist routes require authentication
router.use(protect);

// GET    /api/v1/wishlist             — view own wishlist
router.get('/', wishlistController.getWishlist);

// POST   /api/v1/wishlist/items       — add a book
router.post('/items', validateAddBook, wishlistController.addBook);

// DELETE /api/v1/wishlist/items/:bookId — remove a book
router.delete('/items/:bookId', wishlistController.removeBook);

module.exports = router;