const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const reservationController = require('../controllers/reservationController');
const waitlistController = require('../controllers/waitlistController');
const availabilityController = require('../controllers/availabilityController');
const {
  createReservationSchema,
  updateReservationSchema,
  getReservationsQuerySchema,
  checkAvailabilitySchema,
  analyticsQuerySchema,
  bulkUpdateReservationsSchema,
  reservationIdSchema,
  reservationParamsSchema
} = require('../schemas/reservationSchemas');
const {
  addToWaitlistSchema,
  updateWaitlistEntrySchema,
  getWaitlistQuerySchema,
  bulkUpdateWaitlistSchema,
  convertToReservationSchema,
  notifyWaitlistEntrySchema,
  waitlistAnalyticsQuerySchema,
  waitlistIdSchema,
  restaurantWaitlistParamsSchema
} = require('../schemas/waitlistSchemas');

const router = express.Router({ mergeParams: true });

// Apply authentication and authorization middleware
router.use(authenticate);
router.use(authorizeRestaurant);

// RESERVATION ROUTES

// Create a new reservation
router.post('/', 
  validate(createReservationSchema, 'body'),
  reservationController.createReservation
);

// Get all reservations with filtering and pagination
router.get('/', 
  validate(getReservationsQuerySchema, 'query'),
  reservationController.getReservations
);

// Get reservation analytics
router.get('/analytics', 
  validate(analyticsQuerySchema, 'query'),
  reservationController.getReservationAnalytics
);

// Get reservation calendar view
router.get('/calendar', 
  reservationController.getReservationCalendar
);

// Get daily summary
router.get('/summary/daily', 
  reservationController.getDailySummary
);

// Bulk update reservations
router.patch('/bulk', 
  validate(bulkUpdateReservationsSchema, 'body'),
  reservationController.bulkUpdateReservations
);

// Get specific reservation
router.get('/:id', 
  validate(reservationParamsSchema, 'params'),
  reservationController.getReservation
);

// Update specific reservation
router.patch('/:id', 
  validate(reservationParamsSchema, 'params'),
  validate(updateReservationSchema, 'body'),
  reservationController.updateReservation
);

// Delete specific reservation
router.delete('/:id', 
  validate(reservationParamsSchema, 'params'),
  reservationController.deleteReservation
);

// AVAILABILITY ROUTES

// Check availability for a specific time slot
router.get('/availability/check', 
  validate(checkAvailabilitySchema, 'query'),
  availabilityController.checkAvailability
);

// Get available time slots for a date
router.get('/availability/slots', 
  availabilityController.getTimeSlots
);

// Get daily availability overview
router.get('/availability/daily', 
  availabilityController.getDailyAvailability
);

// Get weekly availability overview
router.get('/availability/weekly', 
  availabilityController.getWeeklyAvailability
);

// Get table availability for a specific time
router.get('/availability/tables', 
  availabilityController.getTableAvailability
);

// Get optimal table recommendation
router.get('/availability/optimal', 
  availabilityController.getOptimalTable
);

// Get availability statistics
router.get('/availability/stats', 
  availabilityController.getAvailabilityStats
);

// WAITLIST ROUTES

// Add customer to waitlist
router.post('/waitlist', 
  validate(addToWaitlistSchema, 'body'),
  waitlistController.addToWaitlist
);

// Get waitlist entries
router.get('/waitlist', 
  validate(getWaitlistQuerySchema, 'query'),
  waitlistController.getWaitlist
);

// Bulk update waitlist entries
router.patch('/waitlist/bulk', 
  validate(bulkUpdateWaitlistSchema, 'body'),
  waitlistController.bulkUpdateWaitlist
);

// Get specific waitlist entry
router.get('/waitlist/:id', 
  validate(restaurantWaitlistParamsSchema, 'params'),
  waitlistController.getWaitlistEntry
);

// Update waitlist entry
router.patch('/waitlist/:id', 
  validate(restaurantWaitlistParamsSchema, 'params'),
  validate(updateWaitlistEntrySchema, 'body'),
  waitlistController.updateWaitlistEntry
);

// Remove from waitlist
router.delete('/waitlist/:id', 
  validate(restaurantWaitlistParamsSchema, 'params'),
  waitlistController.removeFromWaitlist
);

// Notify waitlist customer
router.post('/waitlist/:id/notify', 
  validate(restaurantWaitlistParamsSchema, 'params'),
  validate(notifyWaitlistEntrySchema, 'body'),
  waitlistController.notifyWaitlistEntry
);

// Convert waitlist entry to reservation
router.post('/waitlist/:id/convert', 
  validate(restaurantWaitlistParamsSchema, 'params'),
  validate(convertToReservationSchema, 'body'),
  waitlistController.convertToReservation
);

module.exports = router;