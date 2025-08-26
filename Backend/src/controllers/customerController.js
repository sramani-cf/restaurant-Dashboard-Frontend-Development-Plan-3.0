const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

class CustomerController {
  async getCustomers(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const query = req.query;
      
      const prisma = database.getClient();
      
      // Build where clause for customer search
      const where = {
        reservations: {
          some: {
            restaurantId
          }
        },
        ...(query.search && {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } }
          ]
        })
      };

      // Calculate pagination
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const skip = (page - 1) * limit;

      // Get customers with their reservation history
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          include: {
            reservations: {
              where: { restaurantId },
              orderBy: { createdAt: 'desc' },
              take: 5, // Latest 5 reservations
              select: {
                id: true,
                date: true,
                time: true,
                partySize: true,
                status: true,
                createdAt: true
              }
            }
          },
          orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
          skip,
          take: limit
        }),
        prisma.customer.count({ where })
      ]);

      // Transform response to include customer statistics
      const customersWithStats = customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        recentReservations: customer.reservations,
        totalReservations: customer.reservations.length,
        lastVisit: customer.reservations[0]?.date || null,
        status: this.getCustomerStatus(customer.reservations)
      }));

      res.json({
        message: 'Customers retrieved successfully',
        data: customersWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getCustomer(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const prisma = database.getClient();
      
      const customer = await prisma.customer.findFirst({
        where: {
          id,
          reservations: {
            some: { restaurantId }
          }
        },
        include: {
          reservations: {
            where: { restaurantId },
            orderBy: { createdAt: 'desc' },
            include: {
              table: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });

      if (!customer) {
        throw new NotFoundError('Customer not found');
      }

      // Calculate customer statistics
      const stats = this.calculateCustomerStats(customer.reservations);

      res.json({
        message: 'Customer retrieved successfully',
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
          reservationHistory: customer.reservations,
          statistics: stats
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { name, email, phone, notes } = req.body;
      
      const prisma = database.getClient();

      // Check if customer already exists with same email or phone
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            { phone }
          ]
        }
      });

      if (existingCustomer) {
        throw new ConflictError('Customer with this email or phone already exists');
      }

      const customer = await prisma.customer.create({
        data: {
          id: uuidv4(),
          name,
          email: email || null,
          phone,
          notes: notes || null
        }
      });

      logger.info('Customer created successfully:', {
        customerId: customer.id,
        restaurantId,
        name: customer.name
      });

      res.status(201).json({
        message: 'Customer created successfully',
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          createdAt: customer.createdAt
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const { name, email, phone, notes } = req.body;
      
      const prisma = database.getClient();

      // Check if customer exists and has reservations at this restaurant
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          id,
          reservations: {
            some: { restaurantId }
          }
        }
      });

      if (!existingCustomer) {
        throw new NotFoundError('Customer not found');
      }

      // Check for email/phone conflicts with other customers
      if (email || phone) {
        const conflictingCustomer = await prisma.customer.findFirst({
          where: {
            id: { not: id },
            OR: [
              ...(email ? [{ email }] : []),
              ...(phone ? [{ phone }] : [])
            ]
          }
        });

        if (conflictingCustomer) {
          throw new ConflictError('Another customer with this email or phone already exists');
        }
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          name: name || undefined,
          email: email !== undefined ? email : undefined,
          phone: phone || undefined,
          notes: notes !== undefined ? notes : undefined
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          notes: true,
          updatedAt: true
        }
      });

      logger.info('Customer updated successfully:', {
        customerId: id,
        restaurantId
      });

      res.json({
        message: 'Customer updated successfully',
        customer: updatedCustomer
      });

    } catch (error) {
      next(error);
    }
  }

  async getCustomerAnalytics(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate } = req.query;
      
      const prisma = database.getClient();
      
      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);

      const [
        totalCustomers,
        newCustomers,
        returningCustomers,
        reservationStats
      ] = await Promise.all([
        // Total unique customers who have made reservations
        prisma.customer.count({
          where: {
            reservations: {
              some: { restaurantId }
            }
          }
        }),
        
        // New customers in the date range
        prisma.customer.count({
          where: {
            reservations: {
              some: {
                restaurantId,
                ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
              }
            },
            createdAt: dateFilter
          }
        }),
        
        // Returning customers (customers with > 1 reservation)
        prisma.customer.count({
          where: {
            reservations: {
              some: { restaurantId }
            },
            _count: {
              reservations: { gt: 1 }
            }
          }
        }),
        
        // Reservation statistics
        prisma.reservation.groupBy({
          by: ['customerName'],
          where: {
            restaurantId,
            ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
          },
          _count: true
        })
      ]);

      const averageReservationsPerCustomer = reservationStats.length > 0 
        ? reservationStats.reduce((sum, stat) => sum + stat._count, 0) / reservationStats.length 
        : 0;

      res.json({
        message: 'Customer analytics retrieved successfully',
        analytics: {
          totalCustomers,
          newCustomers,
          returningCustomers,
          returningCustomerRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0,
          averageReservationsPerCustomer: Math.round(averageReservationsPerCustomer * 100) / 100
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Helper methods
  getCustomerStatus(reservations) {
    if (!reservations || reservations.length === 0) return 'new';
    
    const recentReservations = reservations.filter(r => 
      new Date(r.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );
    
    if (recentReservations.length > 3) return 'vip';
    if (reservations.length > 5) return 'regular';
    return 'occasional';
  }

  calculateCustomerStats(reservations) {
    const total = reservations.length;
    const completed = reservations.filter(r => r.status === 'COMPLETED').length;
    const cancelled = reservations.filter(r => r.status === 'CANCELLED').length;
    const noShows = reservations.filter(r => r.status === 'NO_SHOW').length;
    
    const totalGuests = reservations.reduce((sum, r) => sum + r.partySize, 0);
    const averagePartySize = total > 0 ? totalGuests / total : 0;
    
    const lastVisit = reservations.length > 0 ? reservations[0].date : null;
    
    return {
      totalReservations: total,
      completedReservations: completed,
      cancelledReservations: cancelled,
      noShowReservations: noShows,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      noShowRate: total > 0 ? (noShows / total) * 100 : 0,
      averagePartySize: Math.round(averagePartySize * 100) / 100,
      totalGuests,
      lastVisit,
      customerSince: reservations.length > 0 ? reservations[reservations.length - 1].createdAt : null
    };
  }
}

module.exports = new CustomerController();