const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         username:
 *           type: string
 *           description: Username (optional)
 *         firstName:
 *           type: string
 *           description: First name
 *         lastName:
 *           type: string
 *           description: Last name
 *         phone:
 *           type: string
 *           description: Phone number
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, RESTAURANT_ADMIN, MANAGER, STAFF, CUSTOMER]
 *           description: User role
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, BANNED]
 *           description: User status
 *         isEmailVerified:
 *           type: boolean
 *           description: Email verification status
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         restaurantStaff:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RestaurantStaff'
 *           description: Restaurant associations for staff users
 *     RestaurantStaff:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Staff record ID
 *         restaurantId:
 *           type: string
 *           format: uuid
 *           description: Restaurant ID
 *         role:
 *           type: string
 *           enum: [GENERAL_MANAGER, HEAD_CHEF, SOUS_CHEF, SERVER, BARTENDER, HOST]
 *           description: Staff role
 *         position:
 *           type: string
 *           description: Position title
 *         department:
 *           type: string
 *           description: Department name
 *         hourlyRate:
 *           type: number
 *           format: float
 *           description: Hourly wage rate
 *         isActive:
 *           type: boolean
 *           description: Whether staff member is active
 *         hiredAt:
 *           type: string
 *           format: date-time
 *           description: Hire date
 *     UpdateUserProfile:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name
 *         lastName:
 *           type: string
 *           description: Last name
 *         phone:
 *           type: string
 *           description: Phone number
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, BANNED]
 *           description: User status (admin only)
 *     UserStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *           description: Total number of users
 *         activeUsers:
 *           type: integer
 *           description: Number of active users
 *         newUsersThisMonth:
 *           type: integer
 *           description: New users registered this month
 *         usersByRole:
 *           type: object
 *           properties:
 *             SUPER_ADMIN:
 *               type: integer
 *             RESTAURANT_ADMIN:
 *               type: integer
 *             MANAGER:
 *               type: integer
 *             STAFF:
 *               type: integer
 *             CUSTOMER:
 *               type: integer
 */

// All user routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users (admin access required)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [SUPER_ADMIN, RESTAURANT_ADMIN, MANAGER, STAFF, CUSTOMER]
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, BANNED]
 *         description: Filter by user status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     $ref: '#/components/schemas/UserProfile'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                     total:
 *                       type: integer
 *                       description: Total number of users
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     stats:
 *                       $ref: '#/components/schemas/UserStats'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'), (req, res) => {
  res.json({
    message: 'User management endpoint',
    data: {
      users: [],
      totalUsers: 0,
      activeUsers: 0
    },
    note: 'User management will be implemented in a future release'
  });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve details of a specific user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID (UUID)
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
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
 *   patch:
 *     summary: Update user profile
 *     description: Update user profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID (UUID)
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfile'
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             phone: "+1-555-123-4567"
 *     responses:
 *       200:
 *         description: User profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
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
router.get('/:id', (req, res) => {
  res.json({
    message: 'Get user details endpoint',
    userId: req.params.id,
    note: 'User management will be implemented in a future release'
  });
});

module.exports = router;