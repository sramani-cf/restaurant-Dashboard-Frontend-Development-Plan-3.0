const Joi = require('joi');

// Common validation patterns
const datePattern = Joi.date().iso().required(); // Allow past dates for development
const timePattern = Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required();
const partySizePattern = Joi.number().integer().min(1).max(20).required();
const durationPattern = Joi.number().integer().min(30).max(480).default(120);

// Customer info validation
const customerInfoSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().min(10).max(20).required(),
  email: Joi.string().email().optional()
});

// Create reservation schema
const createReservationSchema = Joi.object({
  customerInfo: customerInfoSchema.required(),
  date: datePattern,
  time: timePattern,
  partySize: partySizePattern,
  duration: durationPattern.optional(),
  specialRequests: Joi.string().max(500).optional(),
  tableId: Joi.string().uuid().optional(),
  source: Joi.string().valid('dashboard', 'website', 'phone', 'walk-in', 'mobile').default('dashboard')
});

// Update reservation schema
const updateReservationSchema = Joi.object({
  date: Joi.date().iso().optional(),
  time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  partySize: Joi.number().integer().min(1).max(20).optional(),
  duration: Joi.number().integer().min(30).max(480).optional(),
  specialRequests: Joi.string().max(500).optional(),
  notes: Joi.string().max(1000).optional(),
  tableId: Joi.string().uuid().allow(null).optional(),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'ARRIVED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional()
}).min(1);

// Get reservations query schema
const getReservationsQuerySchema = Joi.object({
  date: Joi.date().iso().optional(),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'ARRIVED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
  tableId: Joi.string().uuid().optional(),
  customerId: Joi.string().uuid().optional(),
  search: Joi.string().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('date', 'time', 'customerName', 'partySize', 'status').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

// Check availability schema
const checkAvailabilitySchema = Joi.object({
  date: datePattern,
  time: timePattern,
  partySize: partySizePattern,
  duration: durationPattern.optional(),
  tableId: Joi.string().uuid().optional()
});

// Analytics query schema
const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid('day', 'week', 'month').default('week'),
  includeHours: Joi.boolean().default(true),
  includeUtilization: Joi.boolean().default(true)
});

// Bulk operations schema
const bulkUpdateReservationsSchema = Joi.object({
  reservationIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  updates: Joi.object({
    status: Joi.string().valid('CONFIRMED', 'ARRIVED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW').optional(),
    notes: Joi.string().max(1000).optional()
  }).min(1).required()
});

// Route parameter schemas
const reservationIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const restaurantIdSchema = Joi.object({
  restaurantId: Joi.string().min(1).required() // Allow non-UUID for development
});

// Combined param schemas
const reservationParamsSchema = Joi.object({
  restaurantId: Joi.string().min(1).required(), // Allow non-UUID for development
  id: Joi.string().uuid().required()
});

module.exports = {
  createReservationSchema,
  updateReservationSchema,
  getReservationsQuerySchema,
  checkAvailabilitySchema,
  analyticsQuerySchema,
  bulkUpdateReservationsSchema,
  reservationIdSchema,
  restaurantIdSchema,
  reservationParamsSchema,
  
  // Export sub-schemas for reuse
  customerInfoSchema,
  datePattern,
  timePattern,
  partySizePattern,
  durationPattern
};