const database = require('../config/database');
const logger = require('../config/logger');
const reservationService = require('../services/reservationService');
const { WaitlistDto } = require('../dto/availabilityDto');
const { ReservationDto } = require('../dto/reservationDto');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

class WaitlistController {
  async addToWaitlist(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const waitlistData = WaitlistDto.fromCreateRequest(req.body);
      
      const prisma = database.getClient();
      
      // Verify restaurant exists
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId }
      });
      
      if (!restaurant) {
        throw new NotFoundError('Restaurant not found');
      }

      // Calculate position in waitlist
      const currentPosition = await prisma.waitlistEntry.count({
        where: {
          restaurantId,
          status: 'WAITING'
        }
      });

      // Estimate wait time based on current waitlist and average table turnover
      const estimatedWaitTime = await this.calculateEstimatedWaitTime(
        restaurantId,
        waitlistData.partySize,
        waitlistData.preferredTableType
      );

      // Create waitlist entry
      const waitlistEntry = await prisma.waitlistEntry.create({
        data: {
          ...waitlistData,
          id: uuidv4(),
          restaurantId,
          position: currentPosition + 1,
          estimatedWaitTime: estimatedWaitTime || waitlistData.estimatedWaitTime
        },
        include: {
          table: true,
          restaurant: {
            select: { id: true, name: true }
          }
        }
      });

      logger.info('Customer added to waitlist:', {
        waitlistId: waitlistEntry.id,
        restaurantId,
        customerName: waitlistEntry.customerName,
        partySize: waitlistEntry.partySize,
        position: waitlistEntry.position
      });

      res.status(201).json({
        message: 'Successfully added to waitlist',
        waitlistEntry: WaitlistDto.toResponse(waitlistEntry),
        estimatedWaitTime: estimatedWaitTime,
        position: currentPosition + 1
      });

    } catch (error) {
      next(error);
    }
  }

  async getWaitlist(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const query = req.query;
      
      const prisma = database.getClient();
      
      // Build where clause
      const where = {
        restaurantId,
        ...(query.status && { status: query.status }),
        ...(query.date && { 
          createdAt: {
            gte: new Date(query.date),
            lt: new Date(new Date(query.date).getTime() + 24 * 60 * 60 * 1000)
          }
        }),
        ...(query.partySize && { partySize: parseInt(query.partySize) }),
        ...(query.search && {
          OR: [
            { customerName: { contains: query.search, mode: 'insensitive' } },
            { customerPhone: { contains: query.search } }
          ]
        }),
        ...(query.includeHistory === 'false' && { status: 'WAITING' })
      };

      // Build order by clause
      const orderBy = [];
      if (query.sortBy === 'priority') {
        orderBy.push({ priority: query.sortOrder || 'desc' });
        orderBy.push({ createdAt: 'asc' });
      } else if (query.sortBy === 'estimatedWaitTime') {
        orderBy.push({ estimatedWaitTime: query.sortOrder || 'asc' });
      } else {
        orderBy.push({ [query.sortBy || 'createdAt']: query.sortOrder || 'asc' });
      }

      // Calculate pagination
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const skip = (page - 1) * limit;

      // Get waitlist entries with total count
      const [waitlistEntries, total] = await Promise.all([
        prisma.waitlistEntry.findMany({
          where,
          include: {
            table: true
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.waitlistEntry.count({ where })
      ]);

      res.json({
        message: 'Waitlist retrieved successfully',
        ...WaitlistDto.toListResponse(waitlistEntries, {
          page,
          limit,
          total
        })
      });

    } catch (error) {
      next(error);
    }
  }

  async getWaitlistEntry(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const prisma = database.getClient();
      
      const waitlistEntry = await prisma.waitlistEntry.findFirst({
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

      if (!waitlistEntry) {
        throw new NotFoundError('Waitlist entry not found');
      }

      // Calculate current position for WAITING entries
      let currentPosition = null;
      if (waitlistEntry.status === 'WAITING') {
        currentPosition = await prisma.waitlistEntry.count({
          where: {
            restaurantId,
            status: 'WAITING',
            createdAt: { lt: waitlistEntry.createdAt }
          }
        }) + 1;
      }

      res.json({
        message: 'Waitlist entry retrieved successfully',
        waitlistEntry: {
          ...WaitlistDto.toResponse(waitlistEntry),
          position: currentPosition
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async updateWaitlistEntry(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const updateData = req.body;
      
      const prisma = database.getClient();
      
      // Check if waitlist entry exists
      const existingEntry = await prisma.waitlistEntry.findFirst({
        where: { id, restaurantId }
      });

      if (!existingEntry) {
        throw new NotFoundError('Waitlist entry not found');
      }

      // Add timestamp for status changes
      if (updateData.status && updateData.status !== existingEntry.status) {
        switch (updateData.status) {
          case 'NOTIFIED':
            updateData.lastNotifiedAt = new Date();
            updateData.notificationsSent = (existingEntry.notificationsSent || 0) + 1;
            break;
          case 'SEATED':
            updateData.seatedAt = new Date();
            break;
        }
      }

      // Update waitlist entry
      const updatedEntry = await prisma.waitlistEntry.update({
        where: { id },
        data: updateData,
        include: {
          table: true,
          restaurant: {
            select: { id: true, name: true }
          }
        }
      });

      // Update positions for other WAITING entries if this entry's status changed
      if (updateData.status && updateData.status !== 'WAITING' && existingEntry.status === 'WAITING') {
        await this.updateWaitlistPositions(restaurantId);
      }

      logger.info('Waitlist entry updated successfully:', {
        waitlistId: id,
        restaurantId,
        updates: Object.keys(updateData)
      });

      res.json({
        message: 'Waitlist entry updated successfully',
        waitlistEntry: WaitlistDto.toResponse(updatedEntry)
      });

    } catch (error) {
      next(error);
    }
  }

  async removeFromWaitlist(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const prisma = database.getClient();
      
      const waitlistEntry = await prisma.waitlistEntry.findFirst({
        where: { id, restaurantId }
      });

      if (!waitlistEntry) {
        throw new NotFoundError('Waitlist entry not found');
      }

      await prisma.waitlistEntry.delete({
        where: { id }
      });

      // Update positions for remaining WAITING entries
      await this.updateWaitlistPositions(restaurantId);

      logger.info('Waitlist entry removed successfully:', {
        waitlistId: id,
        restaurantId
      });

      res.json({
        message: 'Waitlist entry removed successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  async notifyWaitlistEntry(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const { notificationMethod, message } = req.body;
      
      const prisma = database.getClient();
      
      const waitlistEntry = await prisma.waitlistEntry.findFirst({
        where: { id, restaurantId }
      });

      if (!waitlistEntry) {
        throw new NotFoundError('Waitlist entry not found');
      }

      if (waitlistEntry.status !== 'WAITING') {
        throw new ConflictError('Can only notify customers who are currently waiting');
      }

      // Update entry with notification info
      const updatedEntry = await prisma.waitlistEntry.update({
        where: { id },
        data: {
          status: 'NOTIFIED',
          lastNotifiedAt: new Date(),
          notificationsSent: (waitlistEntry.notificationsSent || 0) + 1,
          notes: message || waitlistEntry.notes
        },
        include: {
          table: true
        }
      });

      // TODO: Integrate with SMS/call service based on notificationMethod
      logger.info('Waitlist customer notified:', {
        waitlistId: id,
        restaurantId,
        method: notificationMethod,
        customerPhone: waitlistEntry.customerPhone
      });

      res.json({
        message: 'Customer notified successfully',
        waitlistEntry: WaitlistDto.toResponse(updatedEntry)
      });

    } catch (error) {
      next(error);
    }
  }

  async convertToReservation(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const { tableId, reservationTime, duration, specialRequests } = req.body;
      
      const prisma = database.getClient();
      
      // Get waitlist entry
      const waitlistEntry = await prisma.waitlistEntry.findFirst({
        where: { id, restaurantId }
      });

      if (!waitlistEntry) {
        throw new NotFoundError('Waitlist entry not found');
      }

      if (waitlistEntry.status === 'SEATED') {
        throw new ConflictError('Waitlist entry has already been converted to a reservation');
      }

      // Check table availability if specified
      if (tableId) {
        const isAvailable = await reservationService.checkTableAvailability(
          restaurantId,
          tableId,
          new Date(reservationTime),
          new Date(reservationTime).toTimeString().slice(0, 5),
          duration || 120
        );

        if (!isAvailable) {
          throw new ConflictError('Selected table is not available at the requested time');
        }
      }

      // Create reservation from waitlist entry
      const reservationData = {
        id: uuidv4(),
        restaurantId,
        customerName: waitlistEntry.customerName,
        customerPhone: waitlistEntry.customerPhone,
        customerEmail: waitlistEntry.customerEmail,
        date: new Date(reservationTime),
        time: new Date(reservationTime).toTimeString().slice(0, 5),
        partySize: waitlistEntry.partySize,
        duration: duration || 120,
        tableId: tableId || null,
        specialRequests: specialRequests || waitlistEntry.specialRequests,
        source: 'waitlist',
        status: 'CONFIRMED'
      };

      const [reservation] = await prisma.$transaction([
        // Create reservation
        prisma.reservation.create({
          data: reservationData,
          include: {
            table: true,
            restaurant: {
              select: { id: true, name: true }
            }
          }
        }),
        // Update waitlist entry
        prisma.waitlistEntry.update({
          where: { id },
          data: {
            status: 'SEATED',
            seatedAt: new Date(),
            tableId: tableId || null
          }
        })
      ]);

      // Update positions for remaining waitlist entries
      await this.updateWaitlistPositions(restaurantId);

      logger.info('Waitlist entry converted to reservation:', {
        waitlistId: id,
        reservationId: reservation.id,
        restaurantId,
        customerName: reservation.customerName
      });

      res.json({
        message: 'Waitlist entry converted to reservation successfully',
        reservation: ReservationDto.toResponse(reservation)
      });

    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateWaitlist(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { waitlistIds, updates } = req.body;
      
      const prisma = database.getClient();

      // Add timestamps for status updates
      if (updates.status) {
        switch (updates.status) {
          case 'NOTIFIED':
            updates.lastNotifiedAt = new Date();
            break;
          case 'SEATED':
            updates.seatedAt = new Date();
            break;
        }
      }

      const result = await prisma.waitlistEntry.updateMany({
        where: {
          id: { in: waitlistIds },
          restaurantId
        },
        data: updates
      });

      // Update positions if any entries changed from WAITING status
      if (updates.status && updates.status !== 'WAITING') {
        await this.updateWaitlistPositions(restaurantId);
      }

      logger.info('Bulk waitlist update completed:', {
        restaurantId,
        updatedCount: result.count,
        updates: Object.keys(updates)
      });

      res.json({
        message: `${result.count} waitlist entries updated successfully`,
        updatedCount: result.count
      });

    } catch (error) {
      next(error);
    }
  }

  // Helper method to calculate estimated wait time
  async calculateEstimatedWaitTime(restaurantId, partySize, preferredTableType) {
    try {
      const prisma = database.getClient();
      
      // Get current waitlist count for similar party sizes
      const waitlistCount = await prisma.waitlistEntry.count({
        where: {
          restaurantId,
          status: 'WAITING',
          partySize: { lte: partySize + 2, gte: partySize - 2 }
        }
      });

      // Get average table turnover time
      const recentCompletedReservations = await prisma.reservation.findMany({
        where: {
          restaurantId,
          status: 'COMPLETED',
          completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        select: {
          seatedAt: true,
          completedAt: true,
          duration: true
        }
      });

      let averageTurnoverTime = 120; // Default 2 hours
      if (recentCompletedReservations.length > 0) {
        const totalTurnoverTime = recentCompletedReservations.reduce((sum, reservation) => {
          if (reservation.seatedAt && reservation.completedAt) {
            const turnoverTime = (reservation.completedAt - reservation.seatedAt) / (1000 * 60);
            return sum + turnoverTime;
          }
          return sum + (reservation.duration || 120);
        }, 0);
        
        averageTurnoverTime = totalTurnoverTime / recentCompletedReservations.length;
      }

      // Estimate wait time: (position in queue) * (average turnover time) / (available similar tables)
      const availableTables = await prisma.table.count({
        where: {
          restaurantId,
          capacity: { gte: partySize }
        }
      });

      const estimatedTime = Math.ceil((waitlistCount + 1) * (averageTurnoverTime / Math.max(availableTables, 1)));
      
      return Math.min(estimatedTime, 240); // Cap at 4 hours
      
    } catch (error) {
      logger.warn('Failed to calculate estimated wait time:', error);
      return null;
    }
  }

  // Helper method to update waitlist positions
  async updateWaitlistPositions(restaurantId) {
    try {
      const prisma = database.getClient();
      
      const waitingEntries = await prisma.waitlistEntry.findMany({
        where: {
          restaurantId,
          status: 'WAITING'
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      });

      // Update positions
      const updates = waitingEntries.map((entry, index) => 
        prisma.waitlistEntry.update({
          where: { id: entry.id },
          data: { position: index + 1 }
        })
      );

      await prisma.$transaction(updates);
      
    } catch (error) {
      logger.warn('Failed to update waitlist positions:', error);
    }
  }
}

module.exports = new WaitlistController();