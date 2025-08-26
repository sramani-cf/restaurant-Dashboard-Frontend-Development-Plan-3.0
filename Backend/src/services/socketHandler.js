const jwtManager = require('../utils/jwt');
const logger = require('../config/logger');
const database = require('../config/database');

class SocketHandler {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket
    this.restaurantRooms = new Map(); // restaurantId -> Set of userIds
  }

  /**
   * Initialize Socket.IO with authentication and room management
   */
  initialize(io) {
    this.io = io;
    
    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwtManager.verifyAccessToken(token);
        
        // Fetch user data
        const prisma = database.getClient();
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            restaurantStaff: {
              select: {
                id: true,
                restaurantId: true,
                role: true,
                isActive: true,
              },
            },
          },
        });

        if (!user || user.status !== 'ACTIVE') {
          return next(new Error('User not found or inactive'));
        }

        // Attach user data to socket
        socket.userId = user.id;
        socket.user = user;
        
        next();
      } catch (error) {
        logger.warn('Socket authentication failed:', error.message);
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
    
    logger.info('Socket.IO server initialized with authentication');
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const userId = socket.userId;
    const user = socket.user;
    
    logger.info(`User connected via WebSocket: ${user.email} (${userId})`);
    
    // Store connection
    this.connectedUsers.set(userId, socket);
    
    // Join restaurant rooms
    if (user.restaurantStaff && user.restaurantStaff.length > 0) {
      user.restaurantStaff.forEach(staff => {
        if (staff.isActive) {
          const restaurantId = staff.restaurantId;
          socket.join(`restaurant:${restaurantId}`);
          
          // Track users in restaurant rooms
          if (!this.restaurantRooms.has(restaurantId)) {
            this.restaurantRooms.set(restaurantId, new Set());
          }
          this.restaurantRooms.get(restaurantId).add(userId);
          
          logger.debug(`User ${userId} joined restaurant room: ${restaurantId}`);
        }
      });
    }

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Restaurant Dashboard real-time service',
      userId: userId,
      timestamp: new Date().toISOString(),
    });

    // Handle restaurant-specific events
    socket.on('join-restaurant', (data) => this.handleJoinRestaurant(socket, data));
    socket.on('leave-restaurant', (data) => this.handleLeaveRestaurant(socket, data));
    
    // Handle order events
    socket.on('order-status-update', (data) => this.handleOrderStatusUpdate(socket, data));
    socket.on('kitchen-display-update', (data) => this.handleKitchenDisplayUpdate(socket, data));
    
    // Handle reservation events
    socket.on('reservation-update', (data) => this.handleReservationUpdate(socket, data));
    socket.on('table-status-update', (data) => this.handleTableStatusUpdate(socket, data));
    
    // Handle inventory events
    socket.on('inventory-alert', (data) => this.handleInventoryAlert(socket, data));
    
    // Handle live feed subscription
    socket.on('subscribe-live-feed', (data) => this.handleLiveFeedSubscription(socket, data));
    socket.on('unsubscribe-live-feed', (data) => this.handleLiveFeedUnsubscription(socket, data));

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  /**
   * Handle user joining a restaurant room
   */
  handleJoinRestaurant(socket, data) {
    const { restaurantId } = data;
    const userId = socket.userId;
    
    // Verify user has access to this restaurant
    const hasAccess = socket.user.restaurantStaff?.some(
      staff => staff.restaurantId === restaurantId && staff.isActive
    );
    
    if (!hasAccess && socket.user.role !== 'SUPER_ADMIN') {
      socket.emit('error', {
        message: 'Access denied to restaurant',
        restaurantId,
      });
      return;
    }

    socket.join(`restaurant:${restaurantId}`);
    
    if (!this.restaurantRooms.has(restaurantId)) {
      this.restaurantRooms.set(restaurantId, new Set());
    }
    this.restaurantRooms.get(restaurantId).add(userId);

    socket.emit('joined-restaurant', {
      restaurantId,
      timestamp: new Date().toISOString(),
    });

    logger.debug(`User ${userId} joined restaurant room: ${restaurantId}`);
  }

  /**
   * Handle user leaving a restaurant room
   */
  handleLeaveRestaurant(socket, data) {
    const { restaurantId } = data;
    const userId = socket.userId;

    socket.leave(`restaurant:${restaurantId}`);
    
    if (this.restaurantRooms.has(restaurantId)) {
      this.restaurantRooms.get(restaurantId).delete(userId);
    }

    socket.emit('left-restaurant', {
      restaurantId,
      timestamp: new Date().toISOString(),
    });

    logger.debug(`User ${userId} left restaurant room: ${restaurantId}`);
  }

  /**
   * Handle order status updates
   */
  handleOrderStatusUpdate(socket, data) {
    const { orderId, status, restaurantId, tableId } = data;
    
    // Broadcast to restaurant room
    this.io.to(`restaurant:${restaurantId}`).emit('order-status-changed', {
      orderId,
      status,
      tableId,
      timestamp: new Date().toISOString(),
      updatedBy: socket.userId,
    });

    logger.info(`Order status updated: ${orderId} -> ${status}`, {
      restaurantId,
      userId: socket.userId,
    });
  }

  /**
   * Handle kitchen display updates
   */
  handleKitchenDisplayUpdate(socket, data) {
    const { restaurantId, orderData } = data;
    
    // Broadcast to kitchen staff in restaurant
    this.io.to(`restaurant:${restaurantId}`).emit('kitchen-display-updated', {
      ...orderData,
      timestamp: new Date().toISOString(),
    });

    logger.debug('Kitchen display updated', { restaurantId, orderId: orderData.id });
  }

  /**
   * Handle reservation updates
   */
  handleReservationUpdate(socket, data) {
    const { reservationId, status, restaurantId, tableId } = data;
    
    this.io.to(`restaurant:${restaurantId}`).emit('reservation-updated', {
      reservationId,
      status,
      tableId,
      timestamp: new Date().toISOString(),
      updatedBy: socket.userId,
    });

    logger.info(`Reservation updated: ${reservationId} -> ${status}`, {
      restaurantId,
      userId: socket.userId,
    });
  }

  /**
   * Handle table status updates
   */
  handleTableStatusUpdate(socket, data) {
    const { tableId, status, restaurantId } = data;
    
    this.io.to(`restaurant:${restaurantId}`).emit('table-status-changed', {
      tableId,
      status,
      timestamp: new Date().toISOString(),
      updatedBy: socket.userId,
    });

    logger.debug(`Table status updated: ${tableId} -> ${status}`, {
      restaurantId,
      userId: socket.userId,
    });
  }

  /**
   * Handle inventory alerts
   */
  handleInventoryAlert(socket, data) {
    const { restaurantId, itemId, alertType, message } = data;
    
    this.io.to(`restaurant:${restaurantId}`).emit('inventory-alert', {
      itemId,
      alertType, // 'low-stock', 'out-of-stock', 'expired'
      message,
      timestamp: new Date().toISOString(),
    });

    logger.warn(`Inventory alert: ${alertType}`, {
      restaurantId,
      itemId,
      message,
    });
  }

  /**
   * Handle live feed subscriptions
   */
  handleLiveFeedSubscription(socket, data) {
    const { restaurantId, feedTypes = [] } = data;
    
    // Verify access
    const hasAccess = socket.user.restaurantStaff?.some(
      staff => staff.restaurantId === restaurantId && staff.isActive
    );
    
    if (!hasAccess && socket.user.role !== 'SUPER_ADMIN') {
      socket.emit('error', { message: 'Access denied to restaurant feed' });
      return;
    }

    // Join specific feed rooms
    feedTypes.forEach(feedType => {
      socket.join(`feed:${restaurantId}:${feedType}`);
    });

    socket.emit('live-feed-subscribed', {
      restaurantId,
      feedTypes,
      timestamp: new Date().toISOString(),
    });

    logger.debug(`User subscribed to live feeds: ${feedTypes.join(', ')}`, {
      userId: socket.userId,
      restaurantId,
    });
  }

  /**
   * Handle live feed unsubscriptions
   */
  handleLiveFeedUnsubscription(socket, data) {
    const { restaurantId, feedTypes = [] } = data;
    
    feedTypes.forEach(feedType => {
      socket.leave(`feed:${restaurantId}:${feedType}`);
    });

    socket.emit('live-feed-unsubscribed', {
      restaurantId,
      feedTypes,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnection(socket, reason) {
    const userId = socket.userId;
    const user = socket.user;
    
    logger.info(`User disconnected: ${user?.email} (${userId}) - ${reason}`);
    
    // Clean up connections
    this.connectedUsers.delete(userId);
    
    // Clean up restaurant rooms
    this.restaurantRooms.forEach((userSet, restaurantId) => {
      userSet.delete(userId);
      if (userSet.size === 0) {
        this.restaurantRooms.delete(restaurantId);
      }
    });
  }

  /**
   * Broadcast live feed data to restaurant
   */
  broadcastLiveFeedData(restaurantId, feedType, data) {
    if (this.io) {
      this.io.to(`feed:${restaurantId}:${feedType}`).emit('live-feed-data', {
        feedType,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId, notification) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Broadcast notification to restaurant
   */
  broadcastNotificationToRestaurant(restaurantId, notification) {
    if (this.io) {
      this.io.to(`restaurant:${restaurantId}`).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeRestaurants: this.restaurantRooms.size,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new SocketHandler();