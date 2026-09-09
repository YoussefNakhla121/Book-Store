const { z } = require('zod');

// ── Shipping address sub-schema ────────────────────────────────────────────

const shippingAddressSchema = z.object({
  street:  z.string().trim().min(1, 'Street is required'),
  city:    z.string().trim().min(1, 'City is required'),
  state:   z.string().trim().default(''),
  zip:     z.string().trim().min(1, 'ZIP code is required'),
  country: z.string().trim().min(1, 'Country is required'),
});

// ── Checkout (create order) schema ────────────────────────────────────────

const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
});

// ── Admin: update order status schema ─────────────────────────────────────

const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(
    ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    { errorMap: () => ({ message: 'Invalid order status' }) }
  ),
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

const validateCheckout           = makeValidator(checkoutSchema);
const validateUpdateOrderStatus  = makeValidator(updateOrderStatusSchema);

module.exports = { validateCheckout, validateUpdateOrderStatus };
