const { z } = require("zod");

const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters"),

  description: z.string().trim().optional(),
});

function validateCategory(req, res, next) {
  const result = categorySchema.safeParse(req.body);

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

module.exports = {
  validateCategory,
};
