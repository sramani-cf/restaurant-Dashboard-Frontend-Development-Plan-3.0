const Joi = require('joi');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Joi validation middleware factory
 */
const validateSchema = (schema, property = 'body') => {
  return (req, res, next) => {
    const dataToValidate = property === 'body' ? req.body : 
                          property === 'params' ? req.params :
                          property === 'query' ? req.query : req[property];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all validation errors
      allowUnknown: false, // Don't allow unknown fields
      stripUnknown: true, // Remove unknown fields from the validated data
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Validation error:', { errors: validationErrors, data: dataToValidate });

      return res.status(400).json({
        error: 'Validation failed',
        message: 'The provided data is invalid',
        details: validationErrors,
      });
    }

    // Replace the original data with the validated (and potentially sanitized) data
    req[property] = value;
    next();
  };
};

/**
 * Express-validator error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    logger.warn('Express-validator errors:', { errors: validationErrors });

    return res.status(400).json({
      error: 'Validation failed',
      message: 'The provided data is invalid',
      details: validationErrors,
    });
  }

  next();
};

// Common validation schemas
const schemas = {
  // User registration
  userRegister: Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().min(8).max(128).required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    phone: Joi.string().pattern(/^[\+]?[\d\s\-\(\)]+$/).max(20).optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
  }),

  // User login
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Password reset request
  passwordResetRequest: Joi.object({
    email: Joi.string().email().required(),
  }),

  // Password reset
  passwordReset: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),

  // Update profile
  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(100).optional(),
    lastName: Joi.string().min(1).max(100).optional(),
    phone: Joi.string().pattern(/^[\+]?[\d\s\-\(\)]+$/).max(20).optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
  }),

  // Restaurant creation
  createRestaurant: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(1000).optional(),
    address: Joi.string().max(255).required(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    zipCode: Joi.string().max(20).required(),
    country: Joi.string().max(2).default('US'),
    phone: Joi.string().pattern(/^[\+]?[\d\s\-\(\)]+$/).max(20).optional(),
    email: Joi.string().email().max(255).optional(),
    website: Joi.string().uri().max(255).optional(),
    capacity: Joi.number().integer().min(1).max(1000).default(50),
    timezone: Joi.string().max(50).default('America/New_York'),
    currency: Joi.string().length(3).default('USD'),
  }),

  // Table creation
  createTable: Joi.object({
    number: Joi.number().integer().min(1).required(),
    name: Joi.string().max(100).optional(),
    seats: Joi.number().integer().min(1).max(20).required(),
    section: Joi.string().max(50).optional(),
    shape: Joi.string().valid('SQUARE', 'RECTANGLE', 'ROUND', 'OVAL').default('SQUARE'),
    x: Joi.number().integer().min(0).optional(),
    y: Joi.number().integer().min(0).optional(),
    width: Joi.number().integer().min(10).optional(),
    height: Joi.number().integer().min(10).optional(),
  }),

  // Menu item creation
  createMenuItem: Joi.object({
    categoryId: Joi.string().uuid().required(),
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(1000).optional(),
    price: Joi.number().precision(2).min(0).max(9999.99).required(),
    cost: Joi.number().precision(2).min(0).max(9999.99).optional(),
    calories: Joi.number().integer().min(0).max(10000).optional(),
    preparationTime: Joi.number().integer().min(1).max(300).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
    allergens: Joi.array().items(Joi.string().max(50)).max(20).default([]),
    dietaryInfo: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  }),

  // Reservation creation
  createReservation: Joi.object({
    customerId: Joi.string().uuid().optional(),
    tableId: Joi.string().uuid().optional(),
    date: Joi.date().min('now').required(),
    time: Joi.date().required(),
    partySize: Joi.number().integer().min(1).max(20).required(),
    duration: Joi.number().integer().min(30).max(480).default(120),
    specialRequests: Joi.string().max(500).optional(),
    notes: Joi.string().max(500).optional(),
    source: Joi.string().max(50).optional(),
  }),

  // Order creation
  createOrder: Joi.object({
    customerId: Joi.string().uuid().optional(),
    tableId: Joi.string().uuid().optional(),
    type: Joi.string().valid('DINE_IN', 'TAKEOUT', 'DELIVERY', 'CATERING').default('DINE_IN'),
    items: Joi.array().items(Joi.object({
      menuItemId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).max(50).required(),
      modifications: Joi.array().items(Joi.string().max(100)).max(10).default([]),
      specialNotes: Joi.string().max(200).optional(),
    })).min(1).required(),
    notes: Joi.string().max(500).optional(),
    specialInstructions: Joi.string().max(500).optional(),
  }),

  // Customer creation
  createCustomer: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[\+]?[\d\s\-\(\)]+$/).max(20).optional(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().min(1).max(100).required(),
    dateOfBirth: Joi.date().max('now').optional(),
    anniversary: Joi.date().optional(),
    notes: Joi.string().max(1000).optional(),
    dietaryRestrictions: Joi.array().items(Joi.string().max(50)).max(10).default([]),
  }),

  // Inventory item creation
  createInventoryItem: Joi.object({
    supplierId: Joi.string().uuid().optional(),
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().max(100).required(),
    unit: Joi.string().max(20).required(),
    currentStock: Joi.number().precision(3).min(0).required(),
    minimumStock: Joi.number().precision(3).min(0).required(),
    maximumStock: Joi.number().precision(3).min(0).optional(),
    unitCost: Joi.number().precision(2).min(0).max(999999.99).required(),
    expirationDate: Joi.date().min('now').optional(),
    location: Joi.string().max(100).optional(),
    barcode: Joi.string().max(50).optional(),
  }),

  // Query parameters for pagination
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().max(50).optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(255).optional(),
  }),

  // UUID parameter
  uuidParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Date range query
  dateRangeQuery: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    timezone: Joi.string().optional(),
  }).custom((value, helpers) => {
    if (value.startDate && value.endDate && value.startDate > value.endDate) {
      return helpers.error('any.invalid', { message: 'Start date must be before end date' });
    }
    return value;
  }),
};

module.exports = {
  validateSchema,
  handleValidationErrors,
  schemas,
};