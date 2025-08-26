const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

class RestaurantController {
  async getRestaurants(req, res, next) {
    try {
      const prisma = database.getClient();
      const userId = req.user.id;
      
      // Get restaurants the user has access to
      const restaurants = await prisma.restaurant.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              restaurantStaff: {
                some: {
                  userId,
                  isActive: true
                }
              }
            }
          ]
        },
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          settings: true,
          _count: {
            select: {
              tables: true,
              reservations: true,
              orders: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        message: 'Restaurants retrieved successfully',
        restaurants: restaurants.map(restaurant => ({
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          address: restaurant.address,
          city: restaurant.city,
          state: restaurant.state,
          zipCode: restaurant.zipCode,
          country: restaurant.country,
          phone: restaurant.phone,
          email: restaurant.email,
          website: restaurant.website,
          timezone: restaurant.timezone,
          currency: restaurant.currency,
          isActive: restaurant.isActive,
          owner: restaurant.owner,
          settings: restaurant.settings,
          statistics: {
            totalTables: restaurant._count.tables,
            totalReservations: restaurant._count.reservations,
            totalOrders: restaurant._count.orders
          },
          createdAt: restaurant.createdAt,
          updatedAt: restaurant.updatedAt
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  async getRestaurant(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const prisma = database.getClient();
      
      const restaurant = await prisma.restaurant.findFirst({
        where: {
          id,
          OR: [
            { ownerId: userId },
            {
              restaurantStaff: {
                some: {
                  userId,
                  isActive: true
                }
              }
            }
          ]
        },
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          settings: true,
          operatingHours: true,
          tables: {
            select: { id: true, name: true, capacity: true, isActive: true }
          },
          restaurantStaff: {
            where: { isActive: true },
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true }
              }
            }
          }
        }
      });

      if (!restaurant) {
        throw new NotFoundError('Restaurant not found or access denied');
      }

      res.json({
        message: 'Restaurant retrieved successfully',
        restaurant
      });

    } catch (error) {
      next(error);
    }
  }

  async createRestaurant(req, res, next) {
    try {
      const {
        name,
        description,
        address,
        city,
        state,
        zipCode,
        country = 'US',
        phone,
        email,
        website,
        timezone = 'America/New_York',
        currency = 'USD'
      } = req.body;
      
      const userId = req.user.id;
      const prisma = database.getClient();

      // Generate slug from name
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if restaurant name or slug already exists
      const existingRestaurant = await prisma.restaurant.findFirst({
        where: {
          OR: [
            { name },
            { slug }
          ]
        }
      });

      if (existingRestaurant) {
        throw new ConflictError('Restaurant with this name already exists');
      }

      // Create restaurant with default settings
      const restaurant = await prisma.restaurant.create({
        data: {
          id: uuidv4(),
          name,
          slug,
          description: description || null,
          address,
          city,
          state,
          zipCode,
          country,
          phone: phone || null,
          email: email || null,
          website: website || null,
          timezone,
          currency,
          ownerId: userId,
          settings: {
            create: {
              maxAdvanceBookingDays: 60,
              minAdvanceBookingMinutes: 30,
              defaultReservationDuration: 120,
              maxPartySize: 12,
              minPartySize: 1,
              allowWalkIns: true,
              requireConfirmation: true
            }
          }
        },
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          settings: true
        }
      });

      logger.info('Restaurant created successfully:', {
        restaurantId: restaurant.id,
        name: restaurant.name,
        ownerId: userId
      });

      res.status(201).json({
        message: 'Restaurant created successfully',
        restaurant
      });

    } catch (error) {
      next(error);
    }
  }

  async updateRestaurant(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const prisma = database.getClient();

      // Check if user owns the restaurant
      const existingRestaurant = await prisma.restaurant.findFirst({
        where: {
          id,
          ownerId: userId
        }
      });

      if (!existingRestaurant) {
        throw new NotFoundError('Restaurant not found or access denied');
      }

      // Update slug if name is being changed
      if (updateData.name && updateData.name !== existingRestaurant.name) {
        updateData.slug = updateData.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');

        // Check if new slug already exists
        const conflictingRestaurant = await prisma.restaurant.findFirst({
          where: {
            slug: updateData.slug,
            id: { not: id }
          }
        });

        if (conflictingRestaurant) {
          throw new ConflictError('Restaurant name conflicts with existing restaurant');
        }
      }

      const updatedRestaurant = await prisma.restaurant.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          settings: true
        }
      });

      logger.info('Restaurant updated successfully:', {
        restaurantId: id,
        updates: Object.keys(updateData)
      });

      res.json({
        message: 'Restaurant updated successfully',
        restaurant: updatedRestaurant
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RestaurantController();