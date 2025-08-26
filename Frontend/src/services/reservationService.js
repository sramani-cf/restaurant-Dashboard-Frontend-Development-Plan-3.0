import { ApiService } from './api.js'

class ReservationService extends ApiService {
  constructor() {
    super()
  }

  // Get restaurant reservations with filtering and pagination
  async getReservations(restaurantId, params = {}) {
    const queryParams = new URLSearchParams()
    
    // Add filtering parameters
    if (params.date) queryParams.append('date', params.date)
    if (params.status) queryParams.append('status', params.status)
    if (params.tableId) queryParams.append('tableId', params.tableId)
    if (params.customerId) queryParams.append('customerId', params.customerId)
    if (params.search) queryParams.append('search', params.search)
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    
    const endpoint = `/restaurants/${restaurantId}/reservations?${queryParams.toString()}`
    return await this.request(endpoint)
  }

  // Get single reservation details
  async getReservation(reservationId) {
    return await this.request(`/reservations/${reservationId}`)
  }

  // Create new reservation
  async createReservation(restaurantId, reservationData) {
    return await this.request(`/restaurants/${restaurantId}/reservations`, {
      method: 'POST',
      body: JSON.stringify(reservationData),
    })
  }

  // Update existing reservation
  async updateReservation(reservationId, updates) {
    return await this.request(`/reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Cancel reservation
  async cancelReservation(reservationId, reason = '') {
    return await this.request(`/reservations/${reservationId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })
  }

  // Check availability for given parameters
  async checkAvailability(restaurantId, params) {
    const { date, time, partySize, duration = 120 } = params
    const queryParams = new URLSearchParams({
      date,
      time,
      partySize: partySize.toString(),
      duration: duration.toString(),
    })

    return await this.request(`/restaurants/${restaurantId}/reservations/availability?${queryParams.toString()}`)
  }

  // Get available time slots for a specific date
  async getAvailableSlots(restaurantId, date, partySize) {
    const queryParams = new URLSearchParams({
      date,
      partySize: partySize.toString(),
    })

    return await this.request(`/restaurants/${restaurantId}/reservations/slots?${queryParams.toString()}`)
  }

  // Get table status and availability
  async getTableStatus(restaurantId) {
    return await this.request(`/restaurants/${restaurantId}/tables/status`)
  }

  // Update table status
  async updateTableStatus(restaurantId, tableId, status, notes = '') {
    return await this.request(`/restaurants/${restaurantId}/tables/${tableId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    })
  }

  // Assign table to reservation
  async assignTable(reservationId, tableId, notes = '') {
    return await this.request(`/reservations/${reservationId}/assign-table`, {
      method: 'POST',
      body: JSON.stringify({ tableId, notes }),
    })
  }

  // Check for conflicts
  async checkConflicts(restaurantId, reservationData) {
    return await this.request(`/restaurants/${restaurantId}/reservations/conflicts`, {
      method: 'POST',
      body: JSON.stringify(reservationData),
    })
  }

  // Resolve conflicts
  async resolveConflict(conflictId, resolution) {
    return await this.request(`/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    })
  }

  // Waitlist management
  async addToWaitlist(restaurantId, waitlistData) {
    return await this.request(`/restaurants/${restaurantId}/waitlist`, {
      method: 'POST',
      body: JSON.stringify(waitlistData),
    })
  }

  async getWaitlist(restaurantId) {
    return await this.request(`/restaurants/${restaurantId}/waitlist`)
  }

  async updateWaitlistPosition(waitlistId, newPosition) {
    return await this.request(`/waitlist/${waitlistId}/position`, {
      method: 'PUT',
      body: JSON.stringify({ position: newPosition }),
    })
  }

  async promoteFromWaitlist(waitlistId) {
    return await this.request(`/waitlist/${waitlistId}/promote`, {
      method: 'POST',
    })
  }

  async removeFromWaitlist(waitlistId, reason = '') {
    return await this.request(`/waitlist/${waitlistId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    })
  }

  // Analytics and reporting
  async getReservationAnalytics(restaurantId, params = {}) {
    const queryParams = new URLSearchParams()
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.metrics) queryParams.append('metrics', params.metrics.join(','))

    return await this.request(`/restaurants/${restaurantId}/reservations/analytics?${queryParams.toString()}`)
  }

  async getOccupancyReport(restaurantId, date) {
    return await this.request(`/restaurants/${restaurantId}/reservations/occupancy?date=${date}`)
  }

  // Bulk operations
  async bulkUpdateReservations(updates) {
    return await this.request('/reservations/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    })
  }

  async bulkCancelReservations(reservationIds, reason = '') {
    return await this.request('/reservations/bulk-cancel', {
      method: 'DELETE',
      body: JSON.stringify({ reservationIds, reason }),
    })
  }

  // Customer management
  async searchCustomers(query) {
    const queryParams = new URLSearchParams({ q: query })
    return await this.request(`/customers/search?${queryParams.toString()}`)
  }

  async getCustomerHistory(customerId) {
    return await this.request(`/customers/${customerId}/reservations`)
  }

  async getCustomerPreferences(customerId) {
    return await this.request(`/customers/${customerId}/preferences`)
  }

  // Special requests and dietary restrictions
  async getDietaryOptions() {
    return await this.request('/dietary-options')
  }

  async getAccessibilityOptions() {
    return await this.request('/accessibility-options')
  }

  // Notification management
  async sendConfirmation(reservationId, method = 'email') {
    return await this.request(`/reservations/${reservationId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    })
  }

  async sendReminder(reservationId, reminderType = '1hour') {
    return await this.request(`/reservations/${reservationId}/remind`, {
      method: 'POST',
      body: JSON.stringify({ reminderType }),
    })
  }
}

export default new ReservationService()