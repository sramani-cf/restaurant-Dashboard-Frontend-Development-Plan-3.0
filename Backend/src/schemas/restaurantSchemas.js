const Joi = require('joi');

// Create restaurant schema
const createRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  address: Joi.string().max(255).required(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  zipCode: Joi.string().max(20).required(),
  country: Joi.string().length(2).uppercase().default('US'),
  phone: Joi.string().pattern(/^[\+]?[\d\s\-\(\)]+$/).max(20).optional(),
  email: Joi.string().email().max(255).optional(),
  website: Joi.string().uri().max(255).optional(),
  timezone: Joi.string().max(50).default('America/New_York'),
  currency: Joi.string().length(3).uppercase().default('USD')
});

// Update restaurant schema
const updateRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  zipCode: Joi.string().max(20).optional(),
  country: Joi.string().length(2).uppercase().optional(),
  phone: Joi.string().pattern(/^[\+]?[\d\s\-\(\)]+$/).max(20).allow('').optional(),
  email: Joi.string().email().max(255).allow('').optional(),
  website: Joi.string().uri().max(255).allow('').optional(),
  timezone: Joi.string().max(50).optional(),
  currency: Joi.string().length(3).uppercase().optional(),
  isActive: Joi.boolean().optional()
}).min(1);

// Route parameter schemas
const restaurantIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

module.exports = {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantIdSchema
};