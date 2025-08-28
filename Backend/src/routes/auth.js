const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { validateSchema } = require('../middleware/validation');
const {
  userRegister,
  userLogin,
  changePassword,
  updateProfile,
  refreshToken
} = require('../schemas/authSchemas');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *     TokenPair:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         user:
 *           $ref: '#/components/schemas/User'
 *         tokens:
 *           $ref: '#/components/schemas/TokenPair'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: User password (must meet strength requirements)
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: First name
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Last name
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 description: Phone number (optional)
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Username (optional)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or weak password
 *       409:
 *         description: Email or username already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', 
  validateSchema(userRegister),
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     description: Authenticate user and return access and refresh tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or inactive account
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/login', 
  validateSchema(userLogin),
  authController.login
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate new access and refresh tokens using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tokens:
 *                   $ref: '#/components/schemas/TokenPair'
 *       401:
 *         description: Invalid or expired refresh token
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', 
  authController.refreshToken
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate refresh token and blacklist access token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to invalidate
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/logout', 
  optionalAuthenticate, // Optional because user might be logging out with expired token
  authController.logout
);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Invalidate all refresh tokens for the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/logout-all', 
  authenticate,
  authController.logoutAll
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change the authenticated user's password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: New password (must meet strength requirements)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or weak password
 *       401:
 *         description: Current password is incorrect or authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/change-password', 
  authenticate,
  validateSchema(changePassword),
  authController.changePassword
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/profile', 
  authenticate,
  authController.getProfile
);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: First name
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Last name
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 description: Phone number
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 description: Username
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Username already taken
 *       500:
 *         description: Internal server error
 */
router.put('/profile', 
  authenticate,
  validateSchema(updateProfile),
  authController.updateProfile
);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email with OTP code
 *     description: Verify user's email address using the 6-digit verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               verificationCode:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit verification code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired verification code
 *       500:
 *         description: Internal server error
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification code
 *     description: Resend verification code to user's email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 emailSent:
 *                   type: boolean
 *       400:
 *         description: Invalid email or already verified
 *       500:
 *         description: Internal server error
 */
router.post('/resend-verification', authController.resendVerificationCode);

module.exports = router;