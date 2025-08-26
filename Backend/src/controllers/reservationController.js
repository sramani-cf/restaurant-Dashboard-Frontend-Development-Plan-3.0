const database = require('../config/database');
const logger = require('../config/logger');
const reservationService = require('../services/reservationService');
const { ReservationDto, ReservationSummaryDto } = require('../dto/reservationDto');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

class ReservationController {
  async createReservation(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const reservationData = ReservationDto.fromCreateRequest(req.body);
      
      const prisma = database.getClient();
      
      // Verify restaurant exists and user has access
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId }
      });
      
      if (!restaurant) {
        throw new NotFoundError('Restaurant not found');
      }

      // Check table availability if tableId is provided
      if (reservationData.tableId) {
        const isAvailable = await reservationService.checkTableAvailability(
          restaurantId,
          reservationData.tableId,
          reservationData.date,
          reservationData.time,
          reservationData.duration
        );
        
        if (!isAvailable) {
          throw new ConflictError('Selected table is not available at the requested time');
        }
      } else {
        // Find optimal table assignment
        const optimalTable = await reservationService.findOptimalTable(
          restaurantId,
          reservationData.partySize,
          reservationData.date,
          reservationData.time,
          reservationData.duration
        );
        
        if (optimalTable) {
          reservationData.tableId = optimalTable.id;
        }
      }

      // Validate reservation data
      const validation = await reservationService.validateReservationData(
        restaurantId,
        reservationData
      );
      
      if (!validation.isValid) {
        throw new ValidationError('Reservation validation failed', validation.errors);
      }

      // Create reservation
      const reservation = await prisma.reservation.create({
        data: {
          ...reservationData,
          restaurantId,
          id: uuidv4()
        },
        include: {
          table: true,
          restaurant: {
            select: { id: true, name: true }
          }
        }
      });

      // Log reservation creation
      logger.info('Reservation created successfully:', {
        reservationId: reservation.id,
        restaurantId,
        customerName: reservation.customerName,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize
      });

      res.status(201).json({
        message: 'Reservation created successfully',
        reservation: ReservationDto.toResponse(reservation)
      });

    } catch (error) {
      next(error);
    }
  }

  async getReservations(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const query = req.query;
      
      const prisma = database.getClient();
      
      // Build where clause
      const where = {
        restaurantId,
        ...(query.date && { date: new Date(query.date) }),
        ...(query.status && { status: query.status }),
        ...(query.tableId && { tableId: query.tableId }),
        ...(query.search && {
          OR: [
            { customerName: { contains: query.search, mode: 'insensitive' } },
            { customerPhone: { contains: query.search } },
            { customerEmail: { contains: query.search, mode: 'insensitive' } }
          ]
        })
      };

      // Build order by clause
      const orderBy = {};
      orderBy[query.sortBy || 'date'] = query.sortOrder || 'asc';

      // Calculate pagination
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const skip = (page - 1) * limit;

      // Get reservations with total count
      const [reservations, total] = await Promise.all([
        prisma.reservation.findMany({
          where,
          include: {
            table: true,
            restaurant: {
              select: { id: true, name: true }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.reservation.count({ where })
      ]);

      res.json({
        message: 'Reservations retrieved successfully',
        ...ReservationDto.toListResponse(reservations, {
          page,
          limit,
          total
        })
      });

    } catch (error) {
      next(error);
    }
  }

  async getReservation(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const prisma = database.getClient();
      
      const reservation = await prisma.reservation.findFirst({
        where: {
          id,
          restaurantId
        },
        include: {
          table: true,
          restaurant: {
            select: { id: true, name: true }
          }
        }
      });

      if (!reservation) {
        throw new NotFoundError('Reservation not found');
      }

      res.json({
        message: 'Reservation retrieved successfully',
        reservation: ReservationDto.toResponse(reservation)
      });

    } catch (error) {
      next(error);
    }
  }

  async updateReservation(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const updateData = ReservationDto.fromUpdateRequest(req.body);
      
      const prisma = database.getClient();
      
      // Check if reservation exists
      const existingReservation = await prisma.reservation.findFirst({
        where: { id, restaurantId }
      });

      if (!existingReservation) {
        throw new NotFoundError('Reservation not found');
      }

      // If updating date/time/duration/tableId, check availability
      if (updateData.date || updateData.time || updateData.duration || updateData.tableId !== undefined) {
        const checkData = {
          date: updateData.date || existingReservation.date,
          time: updateData.time || existingReservation.time,
          duration: updateData.duration || existingReservation.duration,
          tableId: updateData.tableId !== undefined ? updateData.tableId : existingReservation.tableId
        };

        if (checkData.tableId) {
          const isAvailable = await reservationService.checkTableAvailability(
            restaurantId,
            checkData.tableId,
            checkData.date,
            checkData.time,
            checkData.duration,
            id // Exclude current reservation
          );

          if (!isAvailable) {
            throw new ConflictError('Selected table is not available at the requested time');
          }
        }
      }

      // Add timestamp for status changes
      if (updateData.status) {
        switch (updateData.status) {
          case 'CONFIRMED':
            updateData.confirmedAt = new Date();
            break;
          case 'ARRIVED':
            updateData.arrivedAt = new Date();
            break;
          case 'SEATED':
            updateData.seatedAt = new Date();
            break;
          case 'COMPLETED':
            updateData.completedAt = new Date();
            break;
        }
      }

      // Update reservation
      const updatedReservation = await prisma.reservation.update({
        where: { id },
        data: updateData,
        include: {
          table: true,
          restaurant: {
            select: { id: true, name: true }
          }
        }
      });

      logger.info('Reservation updated successfully:', {
        reservationId: id,
        restaurantId,
        updates: Object.keys(updateData)
      });

      res.json({
        message: 'Reservation updated successfully',
        reservation: ReservationDto.toResponse(updatedReservation)
      });

    } catch (error) {
      next(error);
    }
  }

  async deleteReservation(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const prisma = database.getClient();
      
      const reservation = await prisma.reservation.findFirst({
        where: { id, restaurantId }
      });

      if (!reservation) {
        throw new NotFoundError('Reservation not found');
      }

      await prisma.reservation.delete({
        where: { id }
      });

      logger.info('Reservation deleted successfully:', {
        reservationId: id,
        restaurantId
      });

      res.json({
        message: 'Reservation deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateReservations(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { reservationIds, updates } = req.body;
      
      const prisma = database.getClient();

      // Add status change timestamps
      if (updates.status) {
        switch (updates.status) {
          case 'CONFIRMED':
            updates.confirmedAt = new Date();
            break;
          case 'ARRIVED':
            updates.arrivedAt = new Date();
            break;
          case 'SEATED':
            updates.seatedAt = new Date();
            break;
          case 'COMPLETED':
            updates.completedAt = new Date();
            break;
        }
      }

      const result = await prisma.reservation.updateMany({
        where: {
          id: { in: reservationIds },
          restaurantId
        },
        data: updates
      });

      logger.info('Bulk reservation update completed:', {
        restaurantId,
        updatedCount: result.count,
        updates: Object.keys(updates)
      });

      res.json({
        message: `${result.count} reservations updated successfully`,
        updatedCount: result.count
      });

    } catch (error) {
      next(error);
    }
  }

  async getReservationAnalytics(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const query = req.query;

      const analytics = await reservationService.getReservationAnalytics(
        restaurantId,
        {
          startDate: query.startDate,
          endDate: query.endDate,
          period: query.period || 'week',
          includeHours: query.includeHours !== 'false',
          includeUtilization: query.includeUtilization !== 'false'
        }
      );

      res.json({
        message: 'Reservation analytics retrieved successfully',
        analytics: ReservationDto.toAnalyticsResponse(analytics)
      });

    } catch (error) {
      next(error);
    }
  }

  async getReservationCalendar(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate } = req.query;
      
      const prisma = database.getClient();
      
      const reservations = await prisma.reservation.findMany({
        where: {
          restaurantId,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        include: {
          table: true
        },
        orderBy: [
          { date: 'asc' },
          { time: 'asc' }
        ]
      });

      res.json({
        message: 'Reservation calendar retrieved successfully',
        events: ReservationDto.toCalendarResponse(reservations)
      });

    } catch (error) {
      next(error);
    }
  }

  async getDailySummary(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { date } = req.query;
      
      const summary = await reservationService.getDailySummary(
        restaurantId,
        date ? new Date(date) : new Date()
      );

      res.json({
        message: 'Daily summary retrieved successfully',
        summary: ReservationSummaryDto.toResponse(summary)
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReservationController();