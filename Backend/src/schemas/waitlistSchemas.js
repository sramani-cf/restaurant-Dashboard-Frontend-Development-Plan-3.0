const Joi = require('joi');

// Common validation patterns
const waitlistStatusPattern = Joi.string().valid('WAITING', 'NOTIFIED', 'SEATED', 'CANCELLED', 'NO_SHOW').required();
const priorityPattern = Joi.number().integer().min(1).max(10).default(1);
const estimatedWaitTimePattern = Joi.number().integer().min(0).max(240).optional();

// Customer info validation (reusing from reservationSchemas)
const customerInfoSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().min(10).max(20).required(),
  email: Joi.string().email().optional()
});

// Add to waitlist schema
const addToWaitlistSchema = Joi.object({
  customerInfo: customerInfoSchema.required(),
  partySize: Joi.number().integer().min(1).max(20).required(),
  preferredTableType: Joi.string().valid('booth', 'table', 'bar', 'patio', 'any').default('any'),
  specialRequests: Joi.string().max(500).optional(),
  priority: priorityPattern.optional(),
  estimatedWaitTime: estimatedWaitTimePattern,
  notes: Joi.string().max(1000).optional()
});

// Update waitlist entry schema
const updateWaitlistEntrySchema = Joi.object({
  status: Joi.string().valid('WAITING', 'NOTIFIED', 'SEATED', 'CANCELLED', 'NO_SHOW').optional(),
  estimatedWaitTime: estimatedWaitTimePattern,
  priority: Joi.number().integer().min(1).max(10).optional(),
  notes: Joi.string().max(1000).optional(),
  tableId: Joi.string().uuid().allow(null).optional(),
  specialRequests: Joi.string().max(500).optional()
}).min(1);

// Get waitlist entries query schema
const getWaitlistQuerySchema = Joi.object({
  status: Joi.string().valid('WAITING', 'NOTIFIED', 'SEATED', 'CANCELLED', 'NO_SHOW').optional(),
  date: Joi.date().iso().optional(),
  partySize: Joi.number().integer().min(1).max(20).optional(),
  search: Joi.string().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('createdAt', 'estimatedWaitTime', 'priority', 'partySize', 'customerName').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  includeHistory: Joi.boolean().default(false)
});

// Bulk update waitlist entries schema
const bulkUpdateWaitlistSchema = Joi.object({
  waitlistIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
  updates: Joi.object({
    status: Joi.string().valid('NOTIFIED', 'SEATED', 'CANCELLED', 'NO_SHOW').optional(),
    estimatedWaitTime: estimatedWaitTimePattern,
    priority: Joi.number().integer().min(1).max(10).optional(),
    notes: Joi.string().max(1000).optional()
  }).min(1).required()
});

// Convert waitlist to reservation schema
const convertToReservationSchema = Joi.object({
  waitlistId: Joi.string().uuid().required(),
  tableId: Joi.string().uuid().optional(),
  reservationTime: Joi.date().iso().min('now').required(),
  duration: Joi.number().integer().min(30).max(480).default(120),
  specialRequests: Joi.string().max(500).optional()
});

// Notify waitlist entry schema
const notifyWaitlistEntrySchema = Joi.object({
  waitlistId: Joi.string().uuid().required(),
  notificationMethod: Joi.string().valid('sms', 'call', 'both').default('sms'),
  message: Joi.string().max(500).optional()
});

// Waitlist analytics query schema
const waitlistAnalyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  period: Joi.string().valid('day', 'week', 'month').default('week'),
  includeConversionRate: Joi.boolean().default(true),
  includeWaitTimes: Joi.boolean().default(true),
  includeNoShowRate: Joi.boolean().default(true)
});

// Route parameter schemas
const waitlistIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const restaurantWaitlistParamsSchema = Joi.object({
  restaurantId: Joi.string().uuid().required(),
  id: Joi.string().uuid().required()
});

module.exports = {
  addToWaitlistSchema,
  updateWaitlistEntrySchema,
  getWaitlistQuerySchema,
  bulkUpdateWaitlistSchema,
  convertToReservationSchema,
  notifyWaitlistEntrySchema,
  waitlistAnalyticsQuerySchema,
  waitlistIdSchema,
  restaurantWaitlistParamsSchema,
  
  // Export sub-schemas for reuse
  customerInfoSchema,
  waitlistStatusPattern,
  priorityPattern,
  estimatedWaitTimePattern
};