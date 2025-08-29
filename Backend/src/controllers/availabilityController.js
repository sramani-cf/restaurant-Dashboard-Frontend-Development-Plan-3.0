const database = require('../config/database');
const logger = require('../config/logger');
const reservationService = require('../services/reservationService');
const { AvailabilityDto } = require('../dto/availabilityDto');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

class AvailabilityController {
  async checkAvailability(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { date, time, partySize, duration, tableId } = req.query;
      
      const prisma = database.getClient();
      
      // Verify restaurant exists
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId }
      });
      
      if (!restaurant) {
        throw new NotFoundError('Restaurant not found');
      }

      // For now, assume restaurant is open daily from 11:00 AM to 11:00 PM
      // TODO: Add operating hours and blackout dates table to schema
      const requestDate = new Date(date);
      const [requestHour] = time.split(':').map(Number);
      
      // Simple business hours check (11 AM to 11 PM)
      if (requestHour < 11 || requestHour >= 23) {
        return res.json({
          message: 'Availability checked successfully',
          availability: AvailabilityDto.toResponse({
            date,
            time,
            partySize: parseInt(partySize),
            duration: parseInt(duration) || 120,
            isAvailable: false,
            availableTables: [],
            alternativeSlots: [],
            waitlistAvailable: true,
            message: 'Restaurant is closed at this time (open 11:00 AM - 11:00 PM)'
          })
        });
      }

      let availabilityResult;

      if (tableId) {
        // Check specific table availability
        const isTableAvailable = await reservationService.checkTableAvailability(
          restaurantId,
          tableId,
          date,
          time,
          parseInt(duration) || 120
        );

        if (isTableAvailable) {
          const table = await prisma.table.findUnique({
            where: { id: tableId }
          });

          availabilityResult = {
            date,
            time,
            partySize: parseInt(partySize),
            duration: parseInt(duration) || 120,
            isAvailable: true,
            availableTables: [{
              id: table.id,
              name: table.name,
              capacity: table.capacity,
              location: table.location,
              isOptimal: table.capacity >= parseInt(partySize) && table.capacity <= parseInt(partySize) + 2
            }],
            alternativeSlots: [],
            waitlistAvailable: false
          };
        } else {
          availabilityResult = {
            date,
            time,
            partySize: parseInt(partySize),
            duration: parseInt(duration) || 120,
            isAvailable: false,
            availableTables: [],
            alternativeSlots: await this.getAlternativeSlots(restaurantId, date, time, parseInt(partySize), parseInt(duration) || 120),
            waitlistAvailable: true,
            message: 'Selected table is not available at the requested time'
          };
        }
      } else {
        // Check general availability and find optimal tables
        availabilityResult = await reservationService.checkAvailability(
          restaurantId,
          {
            date,
            time,
            partySize: parseInt(partySize),
            duration: parseInt(duration) || 120
          }
        );
      }

      res.json({
        message: 'Availability checked successfully',
        availability: AvailabilityDto.toResponse(availabilityResult)
      });

    } catch (error) {
      next(error);
    }
  }

  async getTimeSlots(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { date, partySize, duration } = req.query;
      
      const timeSlots = await reservationService.getAvailableTimeSlots(
        restaurantId,
        date,
        parseInt(partySize),
        parseInt(duration) || 120
      );

      res.json({
        message: 'Time slots retrieved successfully',
        timeSlots: AvailabilityDto.toTimeSlotResponse(timeSlots)
      });

    } catch (error) {
      next(error);
    }
  }

  async getDailyAvailability(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { date } = req.query;
      
      const dailyAvailability = await reservationService.getDailyAvailability(
        restaurantId,
        date
      );

      res.json({
        message: 'Daily availability retrieved successfully',
        availability: AvailabilityDto.toDailyAvailabilityResponse(dailyAvailability)
      });

    } catch (error) {
      next(error);
    }
  }

  async getWeeklyAvailability(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { startDate } = req.query;
      
      const weeklyAvailability = await reservationService.getWeeklyAvailability(
        restaurantId,
        startDate
      );

      res.json({
        message: 'Weekly availability retrieved successfully',
        availability: AvailabilityDto.toWeeklyAvailabilityResponse(weeklyAvailability)
      });

    } catch (error) {
      next(error);
    }
  }

  async getTableAvailability(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { date, time } = req.query;
      
      const prisma = database.getClient();
      
      // Get all tables for the restaurant
      const tables = await prisma.table.findMany({
        where: { restaurantId },
        include: {
          reservations: {
            where: {
              date: new Date(date),
              status: { in: ['CONFIRMED', 'ARRIVED', 'SEATED'] }
            },
            orderBy: { time: 'asc' }
          }
        }
      });

      const currentDateTime = new Date(`${date}T${time}`);
      const tableAvailability = [];

      for (const table of tables) {
        const currentReservation = table.reservations.find(reservation => {
          const reservationStart = new Date(`${reservation.date.toISOString().split('T')[0]}T${reservation.time}`);
          const reservationEnd = new Date(reservationStart.getTime() + (reservation.duration * 60000));
          return currentDateTime >= reservationStart && currentDateTime < reservationEnd;
        });

        const nextReservation = table.reservations.find(reservation => {
          const reservationStart = new Date(`${reservation.date.toISOString().split('T')[0]}T${reservation.time}`);
          return reservationStart > currentDateTime;
        });

        // Calculate utilization for today
        const totalMinutesToday = table.reservations.reduce((sum, reservation) => sum + reservation.duration, 0);
        const utilizationToday = (totalMinutesToday / (12 * 60)) * 100; // Assuming 12 hours open

        tableAvailability.push({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          location: table.location,
          isAvailable: !currentReservation,
          currentReservation: currentReservation ? {
            id: currentReservation.id,
            customerName: currentReservation.customerName,
            startTime: `${currentReservation.date.toISOString().split('T')[0]}T${currentReservation.time}`,
            endTime: new Date(new Date(`${currentReservation.date.toISOString().split('T')[0]}T${currentReservation.time}`).getTime() + (currentReservation.duration * 60000)).toISOString(),
            partySize: currentReservation.partySize,
            status: currentReservation.status
          } : null,
          nextReservation: nextReservation ? {
            id: nextReservation.id,
            customerName: nextReservation.customerName,
            startTime: `${nextReservation.date.toISOString().split('T')[0]}T${nextReservation.time}`,
            partySize: nextReservation.partySize
          } : null,
          utilizationToday,
          totalReservationsToday: table.reservations.length
        });
      }

      res.json({
        message: 'Table availability retrieved successfully',
        tables: AvailabilityDto.toTableAvailabilityResponse(tableAvailability)
      });

    } catch (error) {
      next(error);
    }
  }

  async getOptimalTable(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { date, time, partySize, duration } = req.query;
      
      const optimalTable = await reservationService.findOptimalTable(
        restaurantId,
        parseInt(partySize),
        date,
        time,
        parseInt(duration) || 120
      );

      if (!optimalTable) {
        return res.json({
          message: 'No optimal table found',
          optimalTable: {
            recommendedTable: null,
            alternativeTables: [],
            criteria: {}
          }
        });
      }

      // Get alternative tables
      const alternativeTables = await reservationService.getAlternativeTables(
        restaurantId,
        parseInt(partySize),
        date,
        time,
        parseInt(duration) || 120,
        optimalTable.id
      );

      const result = {
        recommendedTable: {
          id: optimalTable.id,
          name: optimalTable.name,
          capacity: optimalTable.capacity,
          location: optimalTable.location,
          score: optimalTable.score || 100,
          reasons: optimalTable.reasons || ['Perfect capacity match', 'Available at requested time']
        },
        alternativeTables: alternativeTables.map(table => ({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          location: table.location,
          score: table.score || 80,
          reasons: table.reasons || ['Available alternative']
        })),
        criteria: {
          capacityMatch: 40,
          locationPreference: 20,
          utilizationBalance: 30,
          customerHistory: 10
        }
      };

      res.json({
        message: 'Optimal table recommendation retrieved successfully',
        optimalTable: AvailabilityDto.toOptimalTableResponse(result)
      });

    } catch (error) {
      next(error);
    }
  }

  async getAvailabilityStats(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { date } = req.query;
      
      const prisma = database.getClient();
      const requestDate = new Date(date);
      
      // Get total capacity
      const totalCapacity = await prisma.table.aggregate({
        where: { restaurantId },
        _sum: { capacity: true }
      });

      // Get reservations for the date
      const reservations = await prisma.reservation.findMany({
        where: {
          restaurantId,
          date: requestDate,
          status: { in: ['CONFIRMED', 'ARRIVED', 'SEATED', 'COMPLETED'] }
        }
      });

      // Calculate utilization by hour
      const hourlyUtilization = {};
      for (let hour = 8; hour <= 23; hour++) {
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        hourlyUtilization[hourKey] = {
          reserved: 0,
          capacity: totalCapacity._sum.capacity || 0,
          utilization: 0
        };

        reservations.forEach(reservation => {
          const reservationHour = parseInt(reservation.time.split(':')[0]);
          const reservationEnd = reservationHour + Math.ceil(reservation.duration / 60);
          
          if (hour >= reservationHour && hour < reservationEnd) {
            hourlyUtilization[hourKey].reserved += reservation.partySize;
          }
        });

        hourlyUtilization[hourKey].utilization = 
          (hourlyUtilization[hourKey].reserved / hourlyUtilization[hourKey].capacity) * 100;
      }

      // Find peak hours
      const peakHours = Object.entries(hourlyUtilization)
        .sort(([,a], [,b]) => b.utilization - a.utilization)
        .slice(0, 3)
        .map(([hour, data]) => ({ hour, utilization: data.utilization }));

      res.json({
        message: 'Availability statistics retrieved successfully',
        stats: {
          date,
          totalCapacity: totalCapacity._sum.capacity || 0,
          totalReservations: reservations.length,
          totalGuests: reservations.reduce((sum, r) => sum + r.partySize, 0),
          overallUtilization: reservations.length > 0 
            ? (reservations.reduce((sum, r) => sum + r.partySize, 0) / (totalCapacity._sum.capacity || 1)) * 100 
            : 0,
          hourlyUtilization,
          peakHours
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Helper method to get alternative time slots
  async getAlternativeSlots(restaurantId, requestedDate, requestedTime, partySize, duration) {
    try {
      const prisma = database.getClient();
      const alternatives = [];
      
      // Generate time slots ±2 hours from requested time
      const requestedHour = parseInt(requestedTime.split(':')[0]);
      const requestedMinute = parseInt(requestedTime.split(':')[1]);
      
      const timeSlots = [];
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue; // Skip the originally requested time
        
        const newHour = requestedHour + Math.floor(i / 2);
        const newMinute = (i % 2 === 0) ? requestedMinute : (requestedMinute === 0 ? 30 : 0);
        
        if (newHour >= 8 && newHour <= 22) {
          timeSlots.push(`${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
        }
      }

      // Check availability for each alternative slot
      for (const timeSlot of timeSlots) {
        const availabilityResult = await reservationService.checkAvailability(
          restaurantId,
          {
            date: requestedDate,
            time: timeSlot,
            partySize,
            duration
          }
        );

        if (availabilityResult.isAvailable) {
          alternatives.push({
            time: timeSlot,
            availableTables: availabilityResult.availableTables.length,
            reason: 'Alternative time slot available'
          });
        }
      }

      return alternatives.slice(0, 5); // Return top 5 alternatives
      
    } catch (error) {
      logger.warn('Failed to get alternative slots:', error);
      return [];
    }
  }
}

module.exports = new AvailabilityController();