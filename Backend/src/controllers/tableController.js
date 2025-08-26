const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

class TableController {
  async getTables(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const query = req.query;
      
      const prisma = database.getClient();
      
      // Build where clause
      const where = {
        restaurantId,
        ...(query.isActive !== undefined && { isActive: query.isActive === 'true' }),
        ...(query.section && { section: query.section }),
        ...(query.minCapacity && { capacity: { gte: parseInt(query.minCapacity) } }),
        ...(query.maxCapacity && { capacity: { lte: parseInt(query.maxCapacity) } })
      };

      const tables = await prisma.table.findMany({
        where,
        include: {
          reservations: {
            where: {
              date: new Date(),
              status: { in: ['CONFIRMED', 'ARRIVED', 'SEATED'] }
            },
            orderBy: { time: 'asc' }
          },
          _count: {
            select: {
              reservations: true
            }
          }
        },
        orderBy: [
          { section: 'asc' },
          { name: 'asc' }
        ]
      });

      // Transform tables with current status
      const tablesWithStatus = tables.map(table => {
        const currentTime = new Date();
        const currentReservation = table.reservations.find(reservation => {
          const reservationStart = new Date(`${reservation.date.toISOString().split('T')[0]}T${reservation.time}`);
          const reservationEnd = new Date(reservationStart.getTime() + (reservation.duration * 60000));
          return currentTime >= reservationStart && currentTime < reservationEnd;
        });

        return {
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          location: table.location,
          section: table.section,
          shape: table.shape,
          isActive: table.isActive,
          status: currentReservation ? 'OCCUPIED' : 'AVAILABLE',
          currentReservation: currentReservation ? {
            id: currentReservation.id,
            customerName: currentReservation.customerName,
            partySize: currentReservation.partySize,
            startTime: `${currentReservation.date.toISOString().split('T')[0]}T${currentReservation.time}`,
            endTime: new Date(new Date(`${currentReservation.date.toISOString().split('T')[0]}T${currentReservation.time}`).getTime() + (currentReservation.duration * 60000)).toISOString(),
            status: currentReservation.status
          } : null,
          upcomingReservations: table.reservations.length,
          totalReservations: table._count.reservations,
          coordinates: {
            x: table.x,
            y: table.y
          },
          dimensions: {
            width: table.width,
            height: table.height
          },
          createdAt: table.createdAt,
          updatedAt: table.updatedAt
        };
      });

      res.json({
        message: 'Tables retrieved successfully',
        tables: tablesWithStatus,
        summary: {
          total: tables.length,
          active: tables.filter(t => t.isActive).length,
          occupied: tablesWithStatus.filter(t => t.status === 'OCCUPIED').length,
          available: tablesWithStatus.filter(t => t.status === 'AVAILABLE' && t.isActive).length
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getTable(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const prisma = database.getClient();
      
      const table = await prisma.table.findFirst({
        where: { id, restaurantId },
        include: {
          reservations: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              reservation: {
                select: {
                  id: true,
                  customerName: true,
                  customerPhone: true,
                  partySize: true,
                  status: true,
                  date: true,
                  time: true,
                  duration: true
                }
              }
            }
          }
        }
      });

      if (!table) {
        throw new NotFoundError('Table not found');
      }

      res.json({
        message: 'Table retrieved successfully',
        table
      });

    } catch (error) {
      next(error);
    }
  }

  async createTable(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const {
        name,
        capacity,
        location,
        section,
        shape = 'RECTANGLE',
        x = 0,
        y = 0,
        width = 100,
        height = 100
      } = req.body;
      
      const prisma = database.getClient();

      // Check if table name already exists in this restaurant
      const existingTable = await prisma.table.findFirst({
        where: { name, restaurantId }
      });

      if (existingTable) {
        throw new ConflictError('Table with this name already exists');
      }

      const table = await prisma.table.create({
        data: {
          id: uuidv4(),
          restaurantId,
          name,
          capacity,
          location: location || null,
          section: section || null,
          shape,
          x,
          y,
          width,
          height,
          isActive: true
        }
      });

      logger.info('Table created successfully:', {
        tableId: table.id,
        restaurantId,
        name: table.name,
        capacity: table.capacity
      });

      res.status(201).json({
        message: 'Table created successfully',
        table
      });

    } catch (error) {
      next(error);
    }
  }

  async updateTable(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const updateData = req.body;
      
      const prisma = database.getClient();

      // Check if table exists
      const existingTable = await prisma.table.findFirst({
        where: { id, restaurantId }
      });

      if (!existingTable) {
        throw new NotFoundError('Table not found');
      }

      // Check for name conflicts if name is being updated
      if (updateData.name && updateData.name !== existingTable.name) {
        const conflictingTable = await prisma.table.findFirst({
          where: {
            name: updateData.name,
            restaurantId,
            id: { not: id }
          }
        });

        if (conflictingTable) {
          throw new ConflictError('Table with this name already exists');
        }
      }

      const updatedTable = await prisma.table.update({
        where: { id },
        data: updateData
      });

      logger.info('Table updated successfully:', {
        tableId: id,
        restaurantId,
        updates: Object.keys(updateData)
      });

      res.json({
        message: 'Table updated successfully',
        table: updatedTable
      });

    } catch (error) {
      next(error);
    }
  }

  async deleteTable(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const prisma = database.getClient();

      // Check if table exists
      const existingTable = await prisma.table.findFirst({
        where: { id, restaurantId }
      });

      if (!existingTable) {
        throw new NotFoundError('Table not found');
      }

      // Check if table has active reservations
      const activeReservations = await prisma.reservation.count({
        where: {
          tableId: id,
          status: { in: ['CONFIRMED', 'ARRIVED', 'SEATED'] },
          date: { gte: new Date() }
        }
      });

      if (activeReservations > 0) {
        throw new ConflictError('Cannot delete table with active reservations');
      }

      // Soft delete by marking as inactive
      const deletedTable = await prisma.table.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info('Table deleted successfully:', {
        tableId: id,
        restaurantId
      });

      res.json({
        message: 'Table deleted successfully',
        table: deletedTable
      });

    } catch (error) {
      next(error);
    }
  }

  async getTableLayout(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const prisma = database.getClient();
      
      const tables = await prisma.table.findMany({
        where: { restaurantId, isActive: true },
        select: {
          id: true,
          name: true,
          capacity: true,
          section: true,
          shape: true,
          x: true,
          y: true,
          width: true,
          height: true
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        message: 'Table layout retrieved successfully',
        layout: {
          tables,
          sections: [...new Set(tables.map(t => t.section).filter(Boolean))]
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TableController();