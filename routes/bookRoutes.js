const express = require("express");

const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateStock,
} = require("../controllers/bookController");

const {
  validateCreateBook,
  validateUpdateBook,
} = require("../validators/bookValidator");

const router = express.Router();

router.get("/", getBooks);

router.get("/:id", getBookById);

router.post("/", validateCreateBook, createBook);

router.put("/:id", validateUpdateBook, updateBook);

router.delete("/:id", deleteBook);

router.patch("/:id/stock", updateStock);

module.exports = router;
