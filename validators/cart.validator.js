const { z } = require('zod');
const mongoose = require('mongoose');

// ── Add / update cart item ──────────────────────────────────────────────────

const addItemSchema = z.object({
  bookId: z
    .string({ required_error: 'bookId is required' })
    .refine((v) => mongoose.Types.ObjectId.isValid(v), 'Invalid bookId'),
  quantity: z.coerce
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .default(1),
});

const updateItemSchema = z.object({
  quantity: z.coerce
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
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

const validateAddItem    = makeValidator(addItemSchema);
const validateUpdateItem = makeValidator(updateItemSchema);

module.exports = { validateAddItem, validateUpdateItem };
