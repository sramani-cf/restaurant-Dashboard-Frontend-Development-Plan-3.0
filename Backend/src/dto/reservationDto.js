class ReservationDto {
  static toResponse(reservation) {
    return {
      id: reservation.id,
      customerInfo: {
        name: reservation.customerName,
        phone: reservation.customerPhone,
        email: reservation.customerEmail
      },
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.partySize,
      duration: reservation.duration,
      status: reservation.status,
      specialRequests: reservation.specialRequests,
      notes: reservation.notes,
      source: reservation.source,
      table: reservation.table ? {
        id: reservation.table.id,
        name: reservation.table.name,
        capacity: reservation.table.capacity,
        location: reservation.table.location
      } : null,
      restaurant: {
        id: reservation.restaurantId,
        name: reservation.restaurant?.name
      },
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      confirmedAt: reservation.confirmedAt,
      arrivedAt: reservation.arrivedAt,
      seatedAt: reservation.seatedAt,
      completedAt: reservation.completedAt
    };
  }

  static toListResponse(reservations, pagination = null) {
    const data = reservations.map(reservation => this.toResponse(reservation));
    
    if (pagination) {
      return {
        data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: Math.ceil(pagination.total / pagination.limit),
          hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
          hasPrev: pagination.page > 1
        }
      };
    }
    
    return { data };
  }

  static fromCreateRequest(requestData) {
    return {
      customerName: requestData.customerInfo.name,
      customerPhone: requestData.customerInfo.phone,
      customerEmail: requestData.customerInfo.email || null,
      date: requestData.date,
      time: requestData.time,
      partySize: requestData.partySize,
      duration: requestData.duration || 120,
      specialRequests: requestData.specialRequests || null,
      tableId: requestData.tableId || null,
      source: requestData.source || 'dashboard',
      status: 'PENDING'
    };
  }

  static fromUpdateRequest(requestData) {
    const updateData = {};
    
    if (requestData.date !== undefined) updateData.date = requestData.date;
    if (requestData.time !== undefined) updateData.time = requestData.time;
    if (requestData.partySize !== undefined) updateData.partySize = requestData.partySize;
    if (requestData.duration !== undefined) updateData.duration = requestData.duration;
    if (requestData.specialRequests !== undefined) updateData.specialRequests = requestData.specialRequests;
    if (requestData.notes !== undefined) updateData.notes = requestData.notes;
    if (requestData.tableId !== undefined) updateData.tableId = requestData.tableId;
    if (requestData.status !== undefined) updateData.status = requestData.status;
    
    return updateData;
  }

  static toAnalyticsResponse(analytics) {
    return {
      summary: {
        totalReservations: analytics.totalReservations,
        confirmedReservations: analytics.confirmedReservations,
        cancelledReservations: analytics.cancelledReservations,
        noShowReservations: analytics.noShowReservations,
        completedReservations: analytics.completedReservations,
        confirmationRate: analytics.confirmationRate,
        noShowRate: analytics.noShowRate,
        averagePartySize: analytics.averagePartySize,
        totalRevenue: analytics.totalRevenue
      },
      hourlyBreakdown: analytics.hourlyBreakdown || [],
      dailyBreakdown: analytics.dailyBreakdown || [],
      tableUtilization: analytics.tableUtilization || [],
      popularTimes: analytics.popularTimes || [],
      peakHours: analytics.peakHours || []
    };
  }

  static toCalendarResponse(reservations) {
    return reservations.map(reservation => ({
      id: reservation.id,
      title: `${reservation.customerName} (${reservation.partySize})`,
      start: `${reservation.date}T${reservation.time}`,
      end: this.calculateEndTime(reservation.date, reservation.time, reservation.duration),
      status: reservation.status,
      partySize: reservation.partySize,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      tableId: reservation.tableId,
      tableName: reservation.table?.name,
      specialRequests: reservation.specialRequests,
      notes: reservation.notes,
      color: this.getStatusColor(reservation.status)
    }));
  }

  static calculateEndTime(date, time, duration) {
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60000));
    return endDateTime.toISOString();
  }

  static getStatusColor(status) {
    const colorMap = {
      'PENDING': '#FFA500',    // Orange
      'CONFIRMED': '#4CAF50',  // Green
      'ARRIVED': '#2196F3',    // Blue
      'SEATED': '#9C27B0',     // Purple
      'COMPLETED': '#607D8B',  // Blue Grey
      'CANCELLED': '#F44336',  // Red
      'NO_SHOW': '#795548'     // Brown
    };
    return colorMap[status] || '#9E9E9E';
  }
}

class ReservationSummaryDto {
  static toResponse(summary) {
    return {
      date: summary.date,
      totalReservations: summary.totalReservations,
      confirmedReservations: summary.confirmedReservations,
      pendingReservations: summary.pendingReservations,
      arrivedReservations: summary.arrivedReservations,
      seatedReservations: summary.seatedReservations,
      completedReservations: summary.completedReservations,
      cancelledReservations: summary.cancelledReservations,
      noShowReservations: summary.noShowReservations,
      totalGuests: summary.totalGuests,
      averagePartySize: summary.averagePartySize,
      tableUtilization: summary.tableUtilization,
      peakHour: summary.peakHour,
      busyPeriods: summary.busyPeriods || []
    };
  }
}

module.exports = {
  ReservationDto,
  ReservationSummaryDto
};