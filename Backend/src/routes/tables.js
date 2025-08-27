const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const tableController = require('../controllers/tableController');
const {
  createTableSchema,
  updateTableSchema,
  getTablesQuerySchema,
  tableParamsSchema
} = require('../schemas/tableSchemas');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Table ID
 *         restaurantId:
 *           type: string
 *           format: uuid
 *           description: Restaurant ID
 *         number:
 *           type: integer
 *           description: Table number
 *         name:
 *           type: string
 *           description: Table name or identifier
 *         seats:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           description: Number of seats
 *         section:
 *           type: string
 *           description: Restaurant section (e.g., Main, Patio, Bar)
 *         shape:
 *           type: string
 *           enum: [SQUARE, RECTANGLE, ROUND, OVAL]
 *           description: Table shape for floor plan
 *         status:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, RESERVED, OUT_OF_ORDER]
 *           description: Current table status
 *         x:
 *           type: integer
 *           description: X coordinate for floor plan (pixels)
 *         y:
 *           type: integer
 *           description: Y coordinate for floor plan (pixels)
 *         width:
 *           type: integer
 *           description: Table width for floor plan (pixels)
 *         height:
 *           type: integer
 *           description: Table height for floor plan (pixels)
 *         isActive:
 *           type: boolean
 *           description: Whether table is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreateTable:
 *       type: object
 *       required:
 *         - name
 *         - capacity
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Table name or identifier
 *         capacity:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           description: Number of seats
 *         location:
 *           type: string
 *           maxLength: 200
 *           description: Specific location description
 *         section:
 *           type: string
 *           maxLength: 50
 *           description: Restaurant section
 *         shape:
 *           type: string
 *           enum: [SQUARE, RECTANGLE, ROUND, OVAL]
 *           default: RECTANGLE
 *           description: Table shape for floor plan
 *         x:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: X coordinate for floor plan (pixels)
 *         y:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Y coordinate for floor plan (pixels)
 *         width:
 *           type: integer
 *           minimum: 50
 *           maximum: 300
 *           default: 100
 *           description: Table width for floor plan (pixels)
 *         height:
 *           type: integer
 *           minimum: 50
 *           maximum: 300
 *           default: 100
 *           description: Table height for floor plan (pixels)
 *     UpdateTable:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Table name or identifier
 *         capacity:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           description: Number of seats
 *         location:
 *           type: string
 *           maxLength: 200
 *           description: Specific location description
 *         section:
 *           type: string
 *           maxLength: 50
 *           description: Restaurant section
 *         shape:
 *           type: string
 *           enum: [SQUARE, RECTANGLE, ROUND, OVAL]
 *           description: Table shape for floor plan
 *         x:
 *           type: integer
 *           minimum: 0
 *           description: X coordinate for floor plan (pixels)
 *         y:
 *           type: integer
 *           minimum: 0
 *           description: Y coordinate for floor plan (pixels)
 *         width:
 *           type: integer
 *           minimum: 50
 *           maximum: 300
 *           description: Table width for floor plan (pixels)
 *         height:
 *           type: integer
 *           minimum: 50
 *           maximum: 300
 *           description: Table height for floor plan (pixels)
 *         isActive:
 *           type: boolean
 *           description: Whether table is active
 *     TableLayout:
 *       type: object
 *       properties:
 *         restaurantId:
 *           type: string
 *           format: uuid
 *           description: Restaurant ID
 *         tables:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Table'
 *           description: List of tables with positioning data
 *         floorPlan:
 *           type: object
 *           properties:
 *             width:
 *               type: integer
 *               description: Floor plan canvas width
 *             height:
 *               type: integer
 *               description: Floor plan canvas height
 *             sections:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Section name
 *                   color:
 *                     type: string
 *                     description: Section color code
 *                   tableCount:
 *                     type: integer
 *                     description: Number of tables in section
 */

// All table routes require authentication and restaurant access
router.use(authenticate);
router.use(authorizeRestaurant);

/**
 * @swagger
 * /restaurants/{restaurantId}/tables:
 *   get:
 *     summary: Get all tables for restaurant
 *     description: Retrieve a list of all tables for the specified restaurant
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         description: Restaurant ID (UUID)
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Filter by restaurant section
 *       - in: query
 *         name: minCapacity
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Minimum seating capacity
 *       - in: query
 *         name: maxCapacity
 *         schema:
 *           type: integer
 *           maximum: 20
 *         description: Maximum seating capacity
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, capacity, section, createdAt]
 *           default: name
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Tables retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Table'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of tables
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Available sections
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', 
  validate(getTablesQuerySchema, 'query'),
  tableController.getTables
);

// Create a new table
router.post('/', 
  validate(createTableSchema, 'body'),
  tableController.createTable
);

// Get table layout for floor plan
router.get('/layout', 
  tableController.getTableLayout
);

// Get specific table
router.get('/:id', 
  validate(tableParamsSchema, 'params'),
  tableController.getTable
);

// Update specific table
router.patch('/:id', 
  validate(tableParamsSchema, 'params'),
  validate(updateTableSchema, 'body'),
  tableController.updateTable
);

// Delete/deactivate table
router.delete('/:id', 
  validate(tableParamsSchema, 'params'),
  tableController.deleteTable
);

module.exports = router;