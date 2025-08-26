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

  connect(restaurantId, userId = null) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:5000'
    
    this.socket = io(socketUrl, {
      query: {
        restaurantId,
        userId,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    })

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

    // Reservation events
    this.socket.on('reservation:created', (data) => {
      this.emit('reservation_created', data)
    })

    this.socket.on('reservation:updated', (data) => {
      this.emit('reservation_updated', data)
    })

    this.socket.on('reservation:cancelled', (data) => {
      this.emit('reservation_cancelled', data)
    })

    this.socket.on('reservation:confirmed', (data) => {
      this.emit('reservation_confirmed', data)
    })

    this.socket.on('reservation:arrived', (data) => {
      this.emit('reservation_arrived', data)
    })

    this.socket.on('reservation:seated', (data) => {
      this.emit('reservation_seated', data)
    })

    this.socket.on('reservation:completed', (data) => {
      this.emit('reservation_completed', data)
    })

    this.socket.on('reservation:no_show', (data) => {
      this.emit('reservation_no_show', data)
    })

    // Table events
    this.socket.on('table:status_changed', (data) => {
      this.emit('table_status_changed', data)
    })

    this.socket.on('table:assigned', (data) => {
      this.emit('table_assigned', data)
    })

    this.socket.on('table:cleaned', (data) => {
      this.emit('table_cleaned', data)
    })

    this.socket.on('table:occupied', (data) => {
      this.emit('table_occupied', data)
    })

    this.socket.on('table:available', (data) => {
      this.emit('table_available', data)
    })

    // Waitlist events
    this.socket.on('waitlist:added', (data) => {
      this.emit('waitlist_added', data)
    })

    this.socket.on('waitlist:promoted', (data) => {
      this.emit('waitlist_promoted', data)
    })

    this.socket.on('waitlist:removed', (data) => {
      this.emit('waitlist_removed', data)
    })

    this.socket.on('waitlist:updated', (data) => {
      this.emit('waitlist_updated', data)
    })

    // Alert events
    this.socket.on('alert:conflict_detected', (data) => {
      this.emit('conflict_detected', data)
    })

    this.socket.on('alert:no_show', (data) => {
      this.emit('no_show_alert', data)
    })

    this.socket.on('alert:long_wait', (data) => {
      this.emit('long_wait_alert', data)
    })

    this.socket.on('alert:double_booking', (data) => {
      this.emit('double_booking_alert', data)
    })

    this.socket.on('alert:vip_arrival', (data) => {
      this.emit('vip_arrival_alert', data)
    })

    // System events
    this.socket.on('system:maintenance', (data) => {
      this.emit('system_maintenance', data)
    })

    this.socket.on('system:update', (data) => {
      this.emit('system_update', data)
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
      this.socket.emit('join_restaurant', { restaurantId })
    }
  }

  leaveRestaurant(restaurantId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_restaurant', { restaurantId })
    }
  }

  subscribeToTable(tableId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe_table', { tableId })
    }
  }

  unsubscribeFromTable(tableId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe_table', { tableId })
    }
  }

  markTableStatus(tableId, status, notes = '') {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_table_status', { tableId, status, notes })
    }
  }

  notifyReservationUpdate(reservationId, update) {
    if (this.socket && this.isConnected) {
      this.socket.emit('reservation_update', { reservationId, update })
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