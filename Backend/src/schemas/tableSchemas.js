const Joi = require('joi');

// Create table schema
const createTableSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  capacity: Joi.number().integer().min(1).max(20).required(),
  location: Joi.string().max(200).optional(),
  section: Joi.string().max(50).optional(),
  shape: Joi.string().valid('SQUARE', 'RECTANGLE', 'ROUND', 'OVAL').default('RECTANGLE'),
  x: Joi.number().integer().min(0).default(0),
  y: Joi.number().integer().min(0).default(0),
  width: Joi.number().integer().min(50).max(300).default(100),
  height: Joi.number().integer().min(50).max(300).default(100)
});

// Update table schema
const updateTableSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  capacity: Joi.number().integer().min(1).max(20).optional(),
  location: Joi.string().max(200).allow('').optional(),
  section: Joi.string().max(50).allow('').optional(),
  shape: Joi.string().valid('SQUARE', 'RECTANGLE', 'ROUND', 'OVAL').optional(),
  x: Joi.number().integer().min(0).optional(),
  y: Joi.number().integer().min(0).optional(),
  width: Joi.number().integer().min(50).max(300).optional(),
  height: Joi.number().integer().min(50).max(300).optional(),
  isActive: Joi.boolean().optional()
}).min(1);

// Get tables query schema
const getTablesQuerySchema = Joi.object({
  isActive: Joi.string().valid('true', 'false').optional(),
  section: Joi.string().max(50).optional(),
  minCapacity: Joi.number().integer().min(1).max(20).optional(),
  maxCapacity: Joi.number().integer().min(1).max(20).optional(),
  sortBy: Joi.string().valid('name', 'capacity', 'section', 'createdAt').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
});

// Route parameter schemas
const tableIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const tableParamsSchema = Joi.object({
  restaurantId: Joi.string().uuid().required(),
  id: Joi.string().uuid().required()
});

module.exports = {
  createTableSchema,
  updateTableSchema,
  getTablesQuerySchema,
  tableIdSchema,
  tableParamsSchema
};