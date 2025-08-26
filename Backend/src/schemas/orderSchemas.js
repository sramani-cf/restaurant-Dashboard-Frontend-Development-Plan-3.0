const Joi = require('joi');

// Order item validation
const orderItemSchema = Joi.object({
  menuItemId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).max(99).required(),
  specialInstructions: Joi.string().max(200).optional()
});

// Create order schema
const createOrderSchema = Joi.object({
  tableId: Joi.string().uuid().required(),
  reservationId: Joi.string().uuid().optional(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  notes: Joi.string().max(500).optional()
});

// Update order schema
const updateOrderSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED').optional(),
  paymentStatus: Joi.string().valid('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED').optional(),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'MOBILE', 'OTHER').optional(),
  tip: Joi.number().min(0).max(1000).optional(),
  notes: Joi.string().max(500).optional()
}).min(1);

// Get orders query schema
const getOrdersQuerySchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED').optional(),
  paymentStatus: Joi.string().valid('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED').optional(),
  tableId: Joi.string().uuid().optional(),
  date: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('createdAt', 'totalAmount', 'status', 'orderNumber').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Order analytics query schema
const orderAnalyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid('day', 'week', 'month', 'year').default('week'),
  includeItems: Joi.boolean().default(true)
});

// Route parameter schemas
const orderIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const orderParamsSchema = Joi.object({
  restaurantId: Joi.string().uuid().required(),
  id: Joi.string().uuid().required()
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  getOrdersQuerySchema,
  orderAnalyticsQuerySchema,
  orderIdSchema,
  orderParamsSchema,
  
  // Export sub-schemas for reuse
  orderItemSchema
};