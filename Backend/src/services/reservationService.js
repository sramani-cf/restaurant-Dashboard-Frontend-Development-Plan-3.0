const database = require('../config/database');
const logger = require('../config/logger');

/**
 * Validates reservation data and business rules
 * @param {Object} reservationData - The reservation data to validate
 * @returns {Object} - Validation result with valid flag and errors array
 */
async function validateReservationData(restaurantId, reservationData) {
  const {
    date,
    time,
    partySize,
    duration,
    tableId,
    excludeReservationId = null
  } = reservationData;
  
  const errors = [];
  const reservationDate = new Date(date);
  const reservationTime = new Date(`${date}T${time}`);
  const now = new Date();
  const prisma = database.getClient();

  try {
    // Check if restaurant exists and is active
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        settings: true,
        operatingHours: true
      }
    });

    if (!restaurant) {
      errors.push('Restaurant not found');
      return { valid: false, errors };
    }

    if (!restaurant.isActive) {
      errors.push('Restaurant is currently inactive');
      return { valid: false, errors };
    }

    // Validate date is not in the past
    if (reservationDate < now.setHours(0, 0, 0, 0)) {
      errors.push('Cannot make reservations for past dates');
    }

    // Check if date is too far in the future (e.g., 60 days)
    const maxAdvanceBookingDays = restaurant.settings?.maxAdvanceBookingDays || 60;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxAdvanceBookingDays);
    
    if (reservationDate > maxDate) {
      errors.push(`Cannot book more than ${maxAdvanceBookingDays} days in advance`);
    }

    // Validate operating hours
    const dayOfWeek = reservationDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const operatingHours = restaurant.operatingHours?.find(oh => oh.dayOfWeek === dayOfWeek);
    
    if (!operatingHours || !operatingHours.isOpen) {
      errors.push('Restaurant is closed on the selected date');
    } else {
      const requestedTime = reservationTime.getHours() * 60 + reservationTime.getMinutes();
      const openTime = operatingHours.openTime; // Assuming stored as minutes from midnight
      const closeTime = operatingHours.closeTime;
      
      if (requestedTime < openTime || requestedTime > closeTime - duration) {
        errors.push(`Reservation time is outside operating hours (${formatTime(openTime)}-${formatTime(closeTime)})`);
      }
    }

    // Validate party size
    const minPartySize = restaurant.settings?.minPartySize || 1;
    const maxPartySize = restaurant.settings?.maxPartySize || 20;
    
    if (partySize < minPartySize || partySize > maxPartySize) {
      errors.push(`Party size must be between ${minPartySize} and ${maxPartySize}`);
    }

    // Validate duration
    const minDuration = restaurant.settings?.minReservationDuration || 30;
    const maxDuration = restaurant.settings?.maxReservationDuration || 480;
    
    if (duration < minDuration || duration > maxDuration) {
      errors.push(`Reservation duration must be between ${minDuration} and ${maxDuration} minutes`);
    }

    // Check advance booking requirements
    const minAdvanceMinutes = restaurant.settings?.minAdvanceBookingMinutes || 30;
    const timeDiffMinutes = Math.floor((reservationTime - now) / (1000 * 60));
    
    if (timeDiffMinutes < minAdvanceMinutes) {
      errors.push(`Reservations must be made at least ${minAdvanceMinutes} minutes in advance`);
    }

    // Validate table if specified
    if (tableId) {
      const table = await prisma.table.findFirst({
        where: {
          id: tableId,
          restaurantId
        }
      });

      if (!table) {
        errors.push('Specified table not found');
      } else if (table.capacity < partySize) {
        errors.push(`Table capacity (${table.capacity}) is insufficient for party size (${partySize})`);
      } else if (!table.isActive) {
        errors.push('Specified table is not available');
      }
    }

    // Check for blackout dates/times
    const blackoutDates = await prisma.blackoutDate.findMany({
      where: {
        restaurantId,
        OR: [
          {
            date: reservationDate
          },
          {
            AND: [
              { startDate: { lte: reservationDate } },
              { endDate: { gte: reservationDate } }
            ]
          }
        ]
      }
    });

    if (blackoutDates.length > 0) {
      errors.push('Selected date is not available for reservations');
    }

    return { isValid: errors.length === 0, errors };

  } catch (error) {
    logger.error('Error validating reservation data:', error);
    return { 
      isValid: false, 
      errors: ['Failed to validate reservation data'] 
    };
  }
}

/**
 * Checks table availability for a specific time slot
 * @param {string} restaurantId - Restaurant ID
 * @param {string} date - Reservation date (YYYY-MM-DD)
 * @param {string} time - Reservation time (HH:MM)
 * @param {number} duration - Duration in minutes
 * @param {number} partySize - Party size
 * @param {string} tableId - Optional specific table ID
 * @param {string} excludeReservationId - Optional reservation ID to exclude from conflict check
 * @returns {Array} - Array of conflicts
 */
async function checkTableAvailability(
  restaurantId, 
  tableId,
  date, 
  time, 
  duration, 
  excludeReservationId = null
) {
  try {
    const prisma = database.getClient();
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    // Buffer time between reservations (e.g., 15 minutes for table turnover)
    const bufferMinutes = 15;
    const bufferStart = new Date(startTime.getTime() - bufferMinutes * 60000);
    const bufferEnd = new Date(endTime.getTime() + bufferMinutes * 60000);

    const whereConditions = {
      restaurantId,
      date: new Date(date),
      status: {
        in: ['CONFIRMED', 'ARRIVED', 'SEATED']
      },
      OR: [
        {
          AND: [
            { time: { lte: bufferStart } },
            { time: { gte: bufferEnd } }
          ]
        },
        {
          AND: [
            { time: { lt: bufferEnd } },
            { 
              time: { 
                gte: new Date(bufferStart.getTime() + parseInt(duration || 120) * 60000) 
              } 
            }
          ]
        }
      ]
    };

    // Exclude current reservation if updating
    if (excludeReservationId) {
      whereConditions.NOT = { id: excludeReservationId };
    }

    // If specific table requested, only check that table
    if (tableId) {
      whereConditions.tableId = tableId;
    }

    const conflictingReservations = await prisma.reservation.findMany({
      where: whereConditions,
      include: {
        table: true,
        customer: true
      }
    });

    // If no specific table requested, check if any suitable tables are available
    if (!tableId && conflictingReservations.length > 0) {
      const availableTables = await getAvailableTablesForSlot(
        restaurantId, 
        date, 
        time, 
        duration, 
        partySize,
        excludeReservationId
      );
      
      if (availableTables.length > 0) {
        return []; // Tables are available, no conflicts
      }
    }

    return conflictingReservations.map(reservation => ({
      id: reservation.id,
      customerName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      phone: reservation.customer.phone,
      time: reservation.time,
      duration: reservation.duration,
      partySize: reservation.partySize,
      tableId: reservation.tableId,
      tableNumber: reservation.table?.number,
      status: reservation.status
    }));

  } catch (error) {
    logger.error('Error checking table availability:', error);
    return [];
  }
}

/**
 * Gets available tables for a specific time slot
 * @param {string} restaurantId - Restaurant ID
 * @param {string} date - Reservation date
 * @param {string} time - Reservation time
 * @param {number} duration - Duration in minutes
 * @param {number} partySize - Party size
 * @param {string} excludeReservationId - Optional reservation ID to exclude
 * @returns {Array} - Array of available tables
 */
async function getAvailableTablesForSlot(restaurantId, date, time, duration, partySize, excludeReservationId = null) {
  try {
    const prisma = database.getClient();
    // Get all suitable tables
    const suitableTables = await prisma.table.findMany({
      where: {
        restaurantId,
        capacity: { gte: partySize },
        isActive: true
      },
      orderBy: [
        { capacity: 'asc' }, // Prefer smaller tables that fit the party
        { number: 'asc' }
      ]
    });

    const availableTables = [];

    for (const table of suitableTables) {
      const conflicts = await checkTableAvailability(
        restaurantId, 
        date, 
        time, 
        duration, 
        partySize, 
        table.id,
        excludeReservationId
      );

      if (conflicts.length === 0) {
        availableTables.push({
          id: table.id,
          number: table.number,
          capacity: table.capacity,
          location: table.location,
          section: table.section
        });
      }
    }

    return availableTables;
  } catch (error) {
    logger.error('Error getting available tables:', error);
    return [];
  }
}

/**
 * Optimizes table assignment using various algorithms
 * @param {string} restaurantId - Restaurant ID
 * @param {string} date - Reservation date
 * @param {string} time - Reservation time
 * @param {number} partySize - Party size
 * @param {number} duration - Duration in minutes
 * @returns {string|null} - Optimal table ID or null if no tables available
 */
async function optimizeTableAssignment(restaurantId, date, time, partySize, duration) {
  try {
    const availableTables = await getAvailableTablesForSlot(restaurantId, date, time, duration, partySize);
    
    if (availableTables.length === 0) {
      return null;
    }

    // Algorithm 1: Perfect fit (exact capacity match)
    const perfectFit = availableTables.find(table => table.capacity === partySize);
    if (perfectFit) {
      return perfectFit.id;
    }

    // Algorithm 2: Smallest table that fits (minimize waste)
    const smallestFit = availableTables
      .filter(table => table.capacity >= partySize)
      .sort((a, b) => a.capacity - b.capacity)[0];
    
    if (smallestFit) {
      return smallestFit.id;
    }

    // Algorithm 3: Consider table location/section preferences
    // This could be enhanced with customer preferences or restaurant layout optimization
    
    // Algorithm 4: Consider future reservations (avoid blocking larger parties)
    const futureReservations = await getFutureReservations(restaurantId, date, time);
    const tableWithLeastImpact = findTableWithLeastFutureImpact(availableTables, futureReservations, partySize);
    
    if (tableWithLeastImpact) {
      return tableWithLeastImpact.id;
    }

    // Fallback: return first available table
    return availableTables[0]?.id || null;

  } catch (error) {
    logger.error('Error optimizing table assignment:', error);
    return null;
  }
}

/**
 * Gets future reservations to consider for optimization
 */
async function getFutureReservations(restaurantId, date, currentTime) {
  try {
    const prisma = database.getClient();
    const currentDateTime = new Date(`${date}T${currentTime}`);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.reservation.findMany({
      where: {
        restaurantId,
        date: new Date(date),
        time: { gt: currentDateTime },
        status: { in: ['CONFIRMED', 'ARRIVED', 'SEATED'] }
      },
      include: { table: true },
      orderBy: { time: 'asc' }
    });
  } catch (error) {
    logger.error('Error getting future reservations:', error);
    return [];
  }
}

/**
 * Finds table with least impact on future reservations
 */
function findTableWithLeastFutureImpact(availableTables, futureReservations, partySize) {
  try {
    let bestTable = null;
    let lowestImpactScore = Infinity;

    for (const table of availableTables) {
      let impactScore = 0;
      
      // Calculate impact on future reservations
      for (const reservation of futureReservations) {
        if (!reservation.tableId) { // Unassigned future reservation
          const partySizeDiff = table.capacity - reservation.partySize;
          
          if (partySizeDiff >= 0) {
            // This table could accommodate the future reservation
            // Prefer leaving larger tables for larger parties
            impactScore += Math.max(0, partySizeDiff - 2); // Penalty for oversized tables
          }
        }
      }
      
      // Prefer tables closer to party size
      const sizeDiff = table.capacity - partySize;
      impactScore += sizeDiff * 0.5;

      if (impactScore < lowestImpactScore) {
        lowestImpactScore = impactScore;
        bestTable = table;
      }
    }

    return bestTable;
  } catch (error) {
    logger.error('Error finding table with least impact:', error);
    return availableTables[0] || null;
  }
}

/**
 * Gets real-time table availability for date/time picker
 * @param {string} restaurantId - Restaurant ID
 * @param {string} date - Date to check
 * @param {number} partySize - Party size
 * @returns {Array} - Array of time slots with availability info
 */
async function getTimeSlotAvailability(restaurantId, date, partySize) {
  try {
    const prisma = database.getClient();
    const timeSlots = [];
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { settings: true, operatingHours: true }
    });

    if (!restaurant) {
      return timeSlots;
    }

    // Get operating hours for the date
    const dayOfWeek = new Date(date).getDay();
    const operatingHours = restaurant.operatingHours?.find(oh => oh.dayOfWeek === dayOfWeek);
    
    if (!operatingHours || !operatingHours.isOpen) {
      return timeSlots; // Restaurant closed
    }

    const startHour = Math.floor(operatingHours.openTime / 60);
    const endHour = Math.floor(operatingHours.closeTime / 60);
    const slotInterval = 30; // 30-minute intervals

    // Generate time slots
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotMinutes = hour * 60 + minute;
        
        // Skip if past closing time minus average meal duration
        if (slotMinutes > operatingHours.closeTime - 120) break;
        
        // Check availability
        const availableTables = await getAvailableTablesForSlot(
          restaurantId, 
          date, 
          slotTime, 
          120, // Default 2-hour duration
          partySize
        );

        const time12 = new Date();
        time12.setHours(hour, minute, 0, 0);
        
        timeSlots.push({
          time: time12.toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          hour24: slotTime,
          available: availableTables.length > 0,
          capacity: availableTables.length,
          tables: availableTables,
          waitTime: availableTables.length === 0 ? calculateWaitTime(restaurantId, date, slotTime) : 0
        });
      }
    }

    return timeSlots;
  } catch (error) {
    logger.error('Error getting time slot availability:', error);
    return [];
  }
}

/**
 * Calculates estimated wait time for a fully booked slot
 */
async function calculateWaitTime(restaurantId, date, time) {
  try {
    const prisma = database.getClient();
    // This is a simplified calculation - in production, this could be more sophisticated
    // based on historical table turnover rates, party sizes, etc.
    
    const slotTime = new Date(`${date}T${time}`);
    const nearbyReservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        date: new Date(date),
        time: {
          gte: new Date(slotTime.getTime() - 60 * 60000), // 1 hour before
          lte: new Date(slotTime.getTime() + 60 * 60000)  // 1 hour after
        },
        status: { in: ['CONFIRMED', 'ARRIVED', 'SEATED'] }
      }
    });

    // Calculate average wait based on reservation density
    const reservationDensity = nearbyReservations.length;
    const baseWaitTime = Math.min(reservationDensity * 15, 90); // Max 90 minutes
    
    return baseWaitTime;
  } catch (error) {
    logger.error('Error calculating wait time:', error);
    return 30; // Default 30-minute wait
  }
}

/**
 * Helper function to format time from minutes to HH:MM
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Finds optimal table for a reservation
 */
async function findOptimalTable(restaurantId, partySize, date, time, duration = 120) {
  try {
    const prisma = database.getClient();
    
    const availableTables = await prisma.table.findMany({
      where: {
        restaurantId,
        capacity: { gte: partySize },
        isActive: true,
        reservations: {
          none: {
            date: new Date(date),
            status: { in: ['CONFIRMED', 'ARRIVED', 'SEATED'] },
            OR: [
              {
                AND: [
                  { time: { lte: time } },
                  { 
                    time: { 
                      gt: new Date(new Date(`${date}T${time}`).getTime() - duration * 60000).toTimeString().slice(0, 5)
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    });

    if (availableTables.length === 0) return null;

    // Score tables based on capacity match and utilization
    const scoredTables = availableTables.map(table => ({
      ...table,
      score: calculateTableScore(table, partySize)
    }));

    return scoredTables.sort((a, b) => b.score - a.score)[0];
  } catch (error) {
    logger.error('Error finding optimal table:', error);
    return null;
  }
}

/**
 * Checks availability for a reservation request
 */
async function checkAvailability(restaurantId, availabilityRequest) {
  try {
    const { date, time, partySize, duration } = availabilityRequest;
    const prisma = database.getClient();
    
    const availableTables = await getAvailableTablesForSlot(restaurantId, date, time, duration, partySize);
    
    return {
      date,
      time,
      partySize,
      duration,
      isAvailable: availableTables.length > 0,
      availableTables: availableTables.map(table => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        isOptimal: table.capacity >= partySize && table.capacity <= partySize + 2
      })),
      waitlistAvailable: true
    };
  } catch (error) {
    logger.error('Error checking availability:', error);
    return {
      isAvailable: false,
      availableTables: [],
      waitlistAvailable: true
    };
  }
}

/**
 * Gets available time slots for a date
 */
async function getAvailableTimeSlots(restaurantId, date, partySize, duration = 120) {
  try {
    const prisma = database.getClient();
    const timeSlots = [];
    
    // Get operating hours
    const dayOfWeek = new Date(date).getDay();
    const operatingHours = await prisma.operatingHours.findFirst({
      where: { restaurantId, dayOfWeek }
    });

    if (!operatingHours || !operatingHours.isOpen) {
      return [];
    }

    // Generate 30-minute intervals
    const startHour = Math.floor(operatingHours.openTime / 60);
    const endHour = Math.floor(operatingHours.closeTime / 60);
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const availableTables = await getAvailableTablesForSlot(restaurantId, date, timeSlot, duration, partySize);
        
        timeSlots.push({
          time: timeSlot,
          isAvailable: availableTables.length > 0,
          availableCapacity: availableTables.reduce((sum, table) => sum + table.capacity, 0),
          availableTables: availableTables.length
        });
      }
    }

    return timeSlots;
  } catch (error) {
    logger.error('Error getting available time slots:', error);
    return [];
  }
}

/**
 * Gets daily availability overview
 */
async function getDailyAvailability(restaurantId, date) {
  try {
    const prisma = database.getClient();
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();
    
    const operatingHours = await prisma.operatingHours.findFirst({
      where: { restaurantId, dayOfWeek }
    });

    if (!operatingHours) {
      return {
        date,
        isOpen: false,
        timeSlots: []
      };
    }

    const timeSlots = await getAvailableTimeSlots(restaurantId, date, 2); // Default 2 people
    const totalCapacity = await prisma.table.aggregate({
      where: { restaurantId },
      _sum: { capacity: true }
    });

    return {
      date,
      isOpen: operatingHours.isOpen,
      operatingHours: {
        openTime: formatTime(operatingHours.openTime),
        closeTime: formatTime(operatingHours.closeTime)
      },
      timeSlots,
      totalCapacity: totalCapacity._sum.capacity || 0
    };
  } catch (error) {
    logger.error('Error getting daily availability:', error);
    return { date, isOpen: false, timeSlots: [] };
  }
}

/**
 * Gets weekly availability overview
 */
async function getWeeklyAvailability(restaurantId, startDate) {
  try {
    const days = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dayAvailability = await getDailyAvailability(restaurantId, currentDate.toISOString().split('T')[0]);
      days.push(dayAvailability);
    }

    const weekEnd = new Date(start);
    weekEnd.setDate(start.getDate() + 6);

    return {
      weekStart: start.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      days,
      summary: {
        totalDaysOpen: days.filter(day => day.isOpen).length,
        averageUtilization: 0, // TODO: Calculate from actual reservations
        peakDay: null,
        quietestDay: null,
        totalReservations: 0
      }
    };
  } catch (error) {
    logger.error('Error getting weekly availability:', error);
    return { days: [] };
  }
}

/**
 * Gets alternative tables for a reservation
 */
async function getAlternativeTables(restaurantId, partySize, date, time, duration, excludeTableId) {
  try {
    const prisma = database.getClient();
    
    const alternatives = await prisma.table.findMany({
      where: {
        restaurantId,
        id: { not: excludeTableId },
        capacity: { gte: partySize },
        isActive: true
      }
    });

    return alternatives.map(table => ({
      ...table,
      score: calculateTableScore(table, partySize),
      reasons: [`Capacity: ${table.capacity}`, 'Available alternative']
    }));
  } catch (error) {
    logger.error('Error getting alternative tables:', error);
    return [];
  }
}

/**
 * Gets reservation analytics
 */
async function getReservationAnalytics(restaurantId, options = {}) {
  try {
    const prisma = database.getClient();
    const { startDate, endDate, period = 'week' } = options;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const reservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        date: { gte: start, lte: end }
      }
    });

    const totalReservations = reservations.length;
    const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED').length;
    const cancelledReservations = reservations.filter(r => r.status === 'CANCELLED').length;
    const noShowReservations = reservations.filter(r => r.status === 'NO_SHOW').length;
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED').length;

    return {
      totalReservations,
      confirmedReservations,
      cancelledReservations,
      noShowReservations,
      completedReservations,
      confirmationRate: totalReservations > 0 ? (confirmedReservations / totalReservations) * 100 : 0,
      noShowRate: totalReservations > 0 ? (noShowReservations / totalReservations) * 100 : 0,
      averagePartySize: totalReservations > 0 ? reservations.reduce((sum, r) => sum + r.partySize, 0) / totalReservations : 0,
      totalRevenue: 0 // TODO: Calculate based on actual revenue data
    };
  } catch (error) {
    logger.error('Error getting reservation analytics:', error);
    return {};
  }
}

/**
 * Gets daily summary
 */
async function getDailySummary(restaurantId, date) {
  try {
    const prisma = database.getClient();
    const targetDate = new Date(date);
    
    const reservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        date: targetDate
      }
    });

    const totalReservations = reservations.length;
    const statusCounts = reservations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    return {
      date: targetDate.toISOString().split('T')[0],
      totalReservations,
      confirmedReservations: statusCounts.CONFIRMED || 0,
      pendingReservations: statusCounts.PENDING || 0,
      arrivedReservations: statusCounts.ARRIVED || 0,
      seatedReservations: statusCounts.SEATED || 0,
      completedReservations: statusCounts.COMPLETED || 0,
      cancelledReservations: statusCounts.CANCELLED || 0,
      noShowReservations: statusCounts.NO_SHOW || 0,
      totalGuests: reservations.reduce((sum, r) => sum + r.partySize, 0),
      averagePartySize: totalReservations > 0 ? reservations.reduce((sum, r) => sum + r.partySize, 0) / totalReservations : 0
    };
  } catch (error) {
    logger.error('Error getting daily summary:', error);
    return {};
  }
}

// Helper function to calculate table score
function calculateTableScore(table, partySize) {
  const capacityDiff = Math.abs(table.capacity - partySize);
  const capacityScore = Math.max(0, 100 - (capacityDiff * 10));
  return capacityScore;
}

// Update all prisma references
function updatePrismaReferences() {
  // This function exists to remind us to update all prisma references in the existing code
  // The existing methods in this file should also be updated to use database.getClient()
  // instead of the global prisma instance
}

module.exports = {
  validateReservationData,
  checkTableAvailability,
  optimizeTableAssignment,
  getTimeSlotAvailability,
  getAvailableTablesForSlot,
  findOptimalTable,
  checkAvailability,
  getAvailableTimeSlots,
  getDailyAvailability,
  getWeeklyAvailability,
  getAlternativeTables,
  getReservationAnalytics,
  getDailySummary,
  formatTime
};