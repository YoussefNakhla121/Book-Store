const mongoose = require("mongoose");

const Book = require("../models/Book");
const Category = require("../models/Category");

// GET ALL BOOKS

async function getBooks(req, res) {
  try {
    let {
      page = 1,
      limit = 5,
      search,
      category,
      author,
      minPrice,
      maxPrice,
      sort = "-createdAt"
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer"
      });
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 50"
      });
    }

    const filter = {};

    // SEARCH

    if (search) {
      filter.$text = {
        $search: search
      };
    }

    // CATEGORY

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID"
        });
      }

      filter.category = category;
    }

    // AUTHOR

    if (author) {
      filter.author = {
        $regex: author,
        $options: "i"
      };
    }

    // PRICE

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.price = {};

      if (minPrice !== undefined) {
        const value = Number(minPrice);

        if (Number.isNaN(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minPrice"
          });
        }

        filter.price.$gte = value;
      }

      if (maxPrice !== undefined) {
        const value = Number(maxPrice);

        if (Number.isNaN(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maxPrice"
          });
        }

        filter.price.$lte = value;
      }
    }

    // SORT

    const allowedSortFields = [
      "price",
      "-price",
      "title",
      "-title",
      "createdAt",
      "-createdAt",
      "stock",
      "-stock"
    ];

    if (!allowedSortFields.includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort field"
      });
    }

    const skip = (page - 1) * limit;

    const totalBooks =
      await Book.countDocuments(filter);

    const books = await Book.find(filter)
      .populate(
        "category",
        "name description"
      )
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: books.length,
      totalBooks,
      page,
      limit,
      totalPages: Math.ceil(
        totalBooks / limit
      ),
      hasNextPage:
        page < Math.ceil(totalBooks / limit),
      hasPreviousPage: page > 1,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// GET BOOK BY ID

async function getBookById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID"
      });
    }

    const book = await Book.findById(id)
      .populate(
        "category",
        "name description"
      );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// CREATE BOOK

async function createBook(req, res) {
  try {
    const categoryExists =
      await Category.findById(req.body.category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const book = await Book.create(req.body);

    const result = await Book.findById(book._id)
      .populate(
        "category",
        "name description"
      );

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: result
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "ISBN already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// UPDATE BOOK

async function updateBook(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID"
      });
    }

    const oldBook = await Book.findById(id);

    if (!oldBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    if (req.body.category) {
      const categoryExists =
        await Category.findById(
          req.body.category
        );

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
    }

    const finalPrice =
      req.body.price !== undefined
        ? req.body.price
        : oldBook.price;

    const finalDiscount =
      req.body.discountPrice !== undefined
        ? req.body.discountPrice
        : oldBook.discountPrice;

    if (
      finalDiscount !== undefined &&
      finalDiscount > finalPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Discount price cannot be greater than price"
      });
    }

    const book =
      await Book.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      ).populate(
        "category",
        "name description"
      );

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "ISBN already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// DELETE BOOK

async function deleteBook(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID"
      });
    }

    const book =
      await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// UPDATE STOCK

async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID"
      });
    }

    if (
      stock === undefined ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock must be a non-negative integer"
      });
    }

    const book =
      await Book.findByIdAndUpdate(
        id,
        {
          stock: Number(stock)
        },
        {
          new: true,
          runValidators: true
        }
      ).populate(
        "category",
        "name description"
      );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateStock
};

