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

// Common validation schemas for legacy support
// NOTE: New features should use dedicated schema files in /schemas directory
const schemas = {
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
  validate: validateSchema, // Export as 'validate' for consistency with route usage
  validateSchema,
  handleValidationErrors,
  schemas,
};