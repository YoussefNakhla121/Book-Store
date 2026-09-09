const { z } = require('zod');

// ── Create review schema ───────────────────────────────────────────────────

const createReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .trim()
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional(),
});

// ── Update review schema ───────────────────────────────────────────────────

const updateReviewSchema = z
  .object({
    rating: z.coerce
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5')
      .optional(),
    comment: z
      .string()
      .trim()
      .max(1000, 'Comment cannot exceed 1000 characters')
      .optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: 'At least one of rating or comment is required',
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

const validateCreateReview = makeValidator(createReviewSchema);
const validateUpdateReview = makeValidator(updateReviewSchema);

module.exports = { validateCreateReview, validateUpdateReview };
