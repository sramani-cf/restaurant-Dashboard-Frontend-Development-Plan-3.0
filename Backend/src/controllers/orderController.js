const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

class OrderController {
  async getOrders(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const query = req.query;
      
      const prisma = database.getClient();
      
      // Build where clause
      const where = {
        restaurantId,
        ...(query.status && { status: query.status }),
        ...(query.tableId && { tableId: query.tableId }),
        ...(query.date && {
          createdAt: {
            gte: new Date(query.date),
            lt: new Date(new Date(query.date).getTime() + 24 * 60 * 60 * 1000)
          }
        })
      };

      // Calculate pagination
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const skip = (page - 1) * limit;

      // Get orders with related data
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            table: {
              select: { id: true, name: true, capacity: true }
            },
            orderItems: {
              include: {
                menuItem: {
                  select: { id: true, name: true, price: true, category: true }
                }
              }
            },
            reservation: {
              select: { id: true, customerName: true, customerPhone: true }
            }
          },
          orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ]);

      // Transform orders for response
      const ordersWithTotals = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        tax: order.tax,
        tip: order.tip,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        table: order.table,
        reservation: order.reservation,
        items: order.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          specialInstructions: item.specialInstructions,
          menuItem: item.menuItem
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        completedAt: order.completedAt
      }));

      res.json({
        message: 'Orders retrieved successfully',
        data: ordersWithTotals,
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

  async getOrder(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const prisma = database.getClient();
      
      const order = await prisma.order.findFirst({
        where: { id, restaurantId },
        include: {
          table: true,
          orderItems: {
            include: {
              menuItem: true
            }
          },
          reservation: {
            select: { 
              id: true, 
              customerName: true, 
              customerPhone: true, 
              customerEmail: true 
            }
          }
        }
      });

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      res.json({
        message: 'Order retrieved successfully',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          subtotal: order.subtotal,
          tax: order.tax,
          tip: order.tip,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          table: order.table,
          reservation: order.reservation,
          items: order.orderItems,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          completedAt: order.completedAt
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async createOrder(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { tableId, reservationId, items, notes } = req.body;
      
      const prisma = database.getClient();

      // Verify table exists
      const table = await prisma.table.findFirst({
        where: { id: tableId, restaurantId }
      });

      if (!table) {
        throw new NotFoundError('Table not found');
      }

      // Verify reservation if provided
      if (reservationId) {
        const reservation = await prisma.reservation.findFirst({
          where: { id: reservationId, restaurantId }
        });

        if (!reservation) {
          throw new NotFoundError('Reservation not found');
        }
      }

      // Calculate totals
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        });

        if (!menuItem) {
          throw new NotFoundError(`Menu item ${item.menuItemId} not found`);
        }

        const itemTotal = menuItem.price * item.quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          id: uuidv4(),
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          totalPrice: itemTotal,
          specialInstructions: item.specialInstructions || null
        });
      }

      const tax = subtotal * 0.08875; // Assuming 8.875% tax rate
      const totalAmount = subtotal + tax;

      // Generate order number
      const orderCount = await prisma.order.count({
        where: { restaurantId }
      });
      const orderNumber = `ORD-${Date.now()}-${(orderCount + 1).toString().padStart(3, '0')}`;

      // Create order with items
      const order = await prisma.order.create({
        data: {
          id: uuidv4(),
          orderNumber,
          restaurantId,
          tableId,
          reservationId: reservationId || null,
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          totalAmount: Math.round(totalAmount * 100) / 100,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          notes: notes || null,
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          table: true,
          orderItems: {
            include: {
              menuItem: true
            }
          },
          reservation: {
            select: { id: true, customerName: true }
          }
        }
      });

      logger.info('Order created successfully:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        restaurantId,
        tableId,
        totalAmount: order.totalAmount
      });

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          table: order.table,
          reservation: order.reservation,
          items: order.orderItems,
          createdAt: order.createdAt
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req, res, next) {
    try {
      const { restaurantId, id } = req.params;
      const updateData = req.body;
      
      const prisma = database.getClient();

      // Check if order exists
      const existingOrder = await prisma.order.findFirst({
        where: { id, restaurantId }
      });

      if (!existingOrder) {
        throw new NotFoundError('Order not found');
      }

      // Add status change timestamps
      if (updateData.status) {
        switch (updateData.status) {
          case 'CONFIRMED':
            updateData.confirmedAt = new Date();
            break;
          case 'PREPARING':
            updateData.preparingAt = new Date();
            break;
          case 'READY':
            updateData.readyAt = new Date();
            break;
          case 'SERVED':
            updateData.servedAt = new Date();
            break;
          case 'COMPLETED':
            updateData.completedAt = new Date();
            break;
        }
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          table: true,
          orderItems: {
            include: {
              menuItem: true
            }
          }
        }
      });

      logger.info('Order updated successfully:', {
        orderId: id,
        restaurantId,
        updates: Object.keys(updateData)
      });

      res.json({
        message: 'Order updated successfully',
        order: updatedOrder
      });

    } catch (error) {
      next(error);
    }
  }

  async getOrderAnalytics(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate } = req.query;
      
      const prisma = database.getClient();
      
      const dateFilter = {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) })
        }
      };

      const [
        totalOrders,
        completedOrders,
        totalRevenue,
        averageOrderValue,
        topItems
      ] = await Promise.all([
        prisma.order.count({
          where: { restaurantId, ...dateFilter }
        }),

        prisma.order.count({
          where: { restaurantId, status: 'COMPLETED', ...dateFilter }
        }),

        prisma.order.aggregate({
          where: { restaurantId, status: 'COMPLETED', ...dateFilter },
          _sum: { totalAmount: true }
        }),

        prisma.order.aggregate({
          where: { restaurantId, status: 'COMPLETED', ...dateFilter },
          _avg: { totalAmount: true }
        }),

        prisma.orderItem.groupBy({
          by: ['menuItemId'],
          where: {
            order: { restaurantId, status: 'COMPLETED', ...dateFilter }
          },
          _sum: { quantity: true },
          _count: true,
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10
        })
      ]);

      res.json({
        message: 'Order analytics retrieved successfully',
        analytics: {
          totalOrders,
          completedOrders,
          completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          averageOrderValue: Math.round((averageOrderValue._avg.totalAmount || 0) * 100) / 100,
          topSellingItems: topItems.map(item => ({
            menuItemId: item.menuItemId,
            totalQuantitySold: item._sum.quantity,
            orderCount: item._count
          }))
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();