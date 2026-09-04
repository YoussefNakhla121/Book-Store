const { z } = require("zod");
const mongoose = require("mongoose");

const createBookSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters"),

    author: z.string().trim().min(2, "Author must be at least 2 characters"),

    isbn: z.string().trim().optional(),

    description: z.string().trim().optional(),

    price: z.coerce.number().min(0, "Price cannot be negative"),

    discountPrice: z.coerce
      .number()
      .min(0, "Discount price cannot be negative")
      .optional(),

    stock: z.coerce
      .number()
      .int("Stock must be an integer")
      .min(0, "Stock cannot be negative"),

    category: z
      .string()
      .refine(
        (value) => mongoose.Types.ObjectId.isValid(value),
        "Invalid category ID",
      ),

    images: z.array(z.string().url("Invalid image URL")).optional(),
  })
  .refine(
    (data) =>
      data.discountPrice === undefined || data.discountPrice <= data.price,
    {
      message: "Discount price cannot be greater than price",
      path: ["discountPrice"],
    },
  );

const updateBookSchema = z
  .object({
    title: z.string().trim().min(2).optional(),

    author: z.string().trim().min(2).optional(),

    isbn: z.string().trim().optional(),

    description: z.string().trim().optional(),

    price: z.coerce.number().min(0).optional(),

    discountPrice: z.coerce.number().min(0).optional(),

    stock: z.coerce.number().int().min(0).optional(),

    category: z
      .string()
      .refine(
        (value) => mongoose.Types.ObjectId.isValid(value),
        "Invalid category ID",
      )
      .optional(),

    images: z.array(z.string().url("Invalid image URL")).optional(),
  })
  .refine(
    (data) => {
      if (data.price !== undefined && data.discountPrice !== undefined) {
        return data.discountPrice <= data.price;
      }

      return true;
    },
    {
      message: "Discount price cannot be greater than price",
      path: ["discountPrice"],
    },
  );

function validateCreateBook(req, res, next) {
  const result = createBookSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.body = result.data;

  next();
}

function validateUpdateBook(req, res, next) {
  const result = updateBookSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required",
    });
  }

  req.body = result.data;

  next();
}

module.exports = {
  validateCreateBook,
  validateUpdateBook,
};
