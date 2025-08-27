const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const restaurantController = require('../controllers/restaurantController');
const {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantIdSchema
} = require('../schemas/restaurantSchemas');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Restaurant ID
 *         name:
 *           type: string
 *           description: Restaurant name
 *         slug:
 *           type: string
 *           description: URL-friendly restaurant identifier
 *         description:
 *           type: string
 *           description: Restaurant description
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State or province
 *         zipCode:
 *           type: string
 *           description: ZIP or postal code
 *         country:
 *           type: string
 *           description: Country code (ISO 3166-1 alpha-2)
 *         phone:
 *           type: string
 *           description: Phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email
 *         website:
 *           type: string
 *           format: uri
 *           description: Website URL
 *         capacity:
 *           type: integer
 *           description: Maximum seating capacity
 *         timezone:
 *           type: string
 *           description: Restaurant timezone
 *         currency:
 *           type: string
 *           description: Default currency (ISO 4217)
 *         isActive:
 *           type: boolean
 *           description: Whether restaurant is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreateRestaurant:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - city
 *         - state
 *         - zipCode
 *       properties:
 *         name:
 *           type: string
 *           description: Restaurant name
 *         description:
 *           type: string
 *           description: Restaurant description
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State or province
 *         zipCode:
 *           type: string
 *           description: ZIP or postal code
 *         country:
 *           type: string
 *           default: US
 *           description: Country code (ISO 3166-1 alpha-2)
 *         phone:
 *           type: string
 *           description: Phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email
 *         website:
 *           type: string
 *           format: uri
 *           description: Website URL
 *         timezone:
 *           type: string
 *           default: America/New_York
 *           description: Restaurant timezone
 *         currency:
 *           type: string
 *           default: USD
 *           description: Default currency (ISO 4217)
 *     UpdateRestaurant:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Restaurant name
 *         description:
 *           type: string
 *           description: Restaurant description
 *         address:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State or province
 *         zipCode:
 *           type: string
 *           description: ZIP or postal code
 *         country:
 *           type: string
 *           description: Country code (ISO 3166-1 alpha-2)
 *         phone:
 *           type: string
 *           description: Phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email
 *         website:
 *           type: string
 *           format: uri
 *           description: Website URL
 *         timezone:
 *           type: string
 *           description: Restaurant timezone
 *         currency:
 *           type: string
 *           description: Default currency (ISO 4217)
 *         isActive:
 *           type: boolean
 *           description: Whether restaurant is active
 */

// All restaurant routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get all restaurants user has access to
 *     description: Retrieve a list of restaurants that the authenticated user has access to based on their role and permissions
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of restaurants retrieved successfully
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
 *                     $ref: '#/components/schemas/Restaurant'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of restaurants
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', restaurantController.getRestaurants);

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     description: Create a new restaurant (admin access required)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRestaurant'
 *           example:
 *             name: "Aura Restaurant"
 *             description: "Fine dining experience in downtown"
 *             address: "1234 Pine Street"
 *             city: "Seattle"
 *             state: "WA"
 *             zipCode: "98101"
 *             country: "US"
 *             phone: "+1-206-555-0100"
 *             email: "info@aura-restaurant.com"
 *             website: "https://aura-restaurant.com"
 *             timezone: "America/Los_Angeles"
 *             currency: "USD"
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Restaurant created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', 
  authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  validate(createRestaurantSchema, 'body'),
  restaurantController.createRestaurant
);

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get a specific restaurant
 *     description: Retrieve details of a specific restaurant by ID
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Restaurant ID (UUID)
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Restaurant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', 
  validate(restaurantIdSchema, 'params'),
  restaurantController.getRestaurant
);

/**
 * @swagger
 * /restaurants/{id}:
 *   patch:
 *     summary: Update a restaurant
 *     description: Update restaurant details (restaurant owner access required)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Restaurant ID (UUID)
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRestaurant'
 *           example:
 *             name: "Aura Restaurant & Bar"
 *             description: "Updated fine dining experience with full bar"
 *             phone: "+1-206-555-0101"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Restaurant updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id', 
  validate(restaurantIdSchema, 'params'),
  validate(updateRestaurantSchema, 'body'),
  restaurantController.updateRestaurant
);

module.exports = router;