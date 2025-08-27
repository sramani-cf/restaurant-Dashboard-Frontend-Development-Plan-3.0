const Joi = require('joi');

// Customer validation patterns
const namePattern = Joi.string().trim().min(2).max(100).required();
const emailPattern = Joi.string().email().optional();
const phonePattern = Joi.string().trim().min(10).max(20).required();

// Create customer schema
const createCustomerSchema = Joi.object({
  name: namePattern,
  email: emailPattern,
  phone: phonePattern,
  notes: Joi.string().max(1000).optional()
});

// Update customer schema
const updateCustomerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().trim().min(10).max(20).optional(),
  notes: Joi.string().max(1000).allow('').optional()
}).min(1);

// Get customers query schema
const getCustomersQuerySchema = Joi.object({
  search: Joi.string().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'email', 'phone', 'createdAt', 'lastVisit').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('new', 'regular', 'vip', 'occasional').optional()
});

// Customer analytics query schema
const customerAnalyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid('day', 'week', 'month', 'year').default('month')
});

// Route parameter schemas
const customerIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const customerParamsSchema = Joi.object({
  restaurantId: Joi.string().min(1).required(), // Allow non-UUID for development
  id: Joi.string().uuid().required()
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomersQuerySchema,
  customerAnalyticsQuerySchema,
  customerIdSchema,
  customerParamsSchema,
  
  // Export patterns for reuse
  namePattern,
  emailPattern,
  phonePattern
};