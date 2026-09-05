const { z } = require('zod');
const mongoose = require('mongoose');

// ── Add book to wishlist schema ────────────────────────────────────────────

const addBookSchema = z.object({
  bookId: z
    .string({ required_error: 'bookId is required' })
    .refine((v) => mongoose.Types.ObjectId.isValid(v), 'Invalid bookId'),
});

// ── Generic validation helper ──────────────────────────────────────────────

function makeValidator(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

const validateAddBook = makeValidator(addBookSchema);

module.exports = { validateAddBook };
