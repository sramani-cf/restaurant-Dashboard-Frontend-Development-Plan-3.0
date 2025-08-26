import { io } from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.listeners = new Map()
  }

  connect(restaurantId, userId = null, token = null) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:8000'
    
    const socketOptions = {
      query: {
        restaurantId,
        userId,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    }

    // Add authentication token if provided
    if (token) {
      socketOptions.auth = { token }
    }
    
    this.socket = io(socketUrl, socketOptions)

    this.setupEventHandlers()
    return this.socket
  }

  setupEventHandlers() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      console.log('WebSocket connected')
      this.emit('connection_established')
    })

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      console.log('WebSocket disconnected:', reason)
      this.emit('connection_lost', reason)
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.attemptReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.emit('connection_error', error)
      this.attemptReconnect()
    })

    // Backend events - match socketHandler.js emissions
    this.socket.on('connected', (data) => {
      this.emit('server_connected', data)
    })

    this.socket.on('joined-restaurant', (data) => {
      this.emit('joined_restaurant', data)
    })

    this.socket.on('left-restaurant', (data) => {
      this.emit('left_restaurant', data)
    })

    // Reservation events from backend
    this.socket.on('reservation-updated', (data) => {
      this.emit('reservation_updated', data)
    })

    // Table events from backend  
    this.socket.on('table-status-changed', (data) => {
      this.emit('table_status_changed', data)
    })

    // Order events from backend
    this.socket.on('order-status-changed', (data) => {
      this.emit('order_status_changed', data)
    })

    this.socket.on('kitchen-display-updated', (data) => {
      this.emit('kitchen_display_updated', data)
    })

    // Inventory events from backend
    this.socket.on('inventory-alert', (data) => {
      this.emit('inventory_alert', data)
    })

    // Live feed events from backend
    this.socket.on('live-feed-subscribed', (data) => {
      this.emit('live_feed_subscribed', data)
    })

    this.socket.on('live-feed-unsubscribed', (data) => {
      this.emit('live_feed_unsubscribed', data)
    })

    this.socket.on('live-feed-data', (data) => {
      this.emit('live_feed_data', data)
    })

    // Notification events from backend
    this.socket.on('notification', (data) => {
      this.emit('notification', data)
    })

    // Error events from backend
    this.socket.on('error', (data) => {
      this.emit('socket_error', data)
    })

    // Ping/Pong for connection health
    this.socket.on('pong', (data) => {
      this.emit('pong_received', data)
    })

  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('max_reconnect_attempts_reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      if (this.socket && !this.isConnected) {
        this.socket.connect()
      }
    }, this.reconnectInterval)
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  emit(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Send events to server
  joinRestaurant(restaurantId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-restaurant', { restaurantId })
    }
  }

  leaveRestaurant(restaurantId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-restaurant', { restaurantId })
    }
  }

  subscribeToLiveFeed(restaurantId, feedTypes = []) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe-live-feed', { restaurantId, feedTypes })
    }
  }

  unsubscribeFromLiveFeed(restaurantId, feedTypes = []) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe-live-feed', { restaurantId, feedTypes })
    }
  }

  sendPing() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping')
    }
  }

  markTableStatus(tableId, status, restaurantId, notes = '') {
    if (this.socket && this.isConnected) {
      this.socket.emit('table-status-update', { tableId, status, restaurantId, notes })
    }
  }

  notifyReservationUpdate(reservationId, status, restaurantId, tableId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('reservation-update', { reservationId, status, restaurantId, tableId })
    }
  }

  acknowledgeAlert(alertId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('acknowledge_alert', { alertId })
    }
  }

  // Connection management
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.listeners.clear()
    }
  }

  isSocketConnected() {
    return this.socket && this.isConnected
  }

  getConnectionState() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    }
  }
}

export default new WebSocketService()