class AvailabilityDto {
  static toResponse(availability) {
    return {
      date: availability.date,
      time: availability.time,
      partySize: availability.partySize,
      duration: availability.duration,
      isAvailable: availability.isAvailable,
      availableTables: availability.availableTables?.map(table => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        isOptimal: table.isOptimal || false,
        reason: table.reason || null
      })) || [],
      alternativeSlots: availability.alternativeSlots?.map(slot => ({
        time: slot.time,
        availableTables: slot.availableTables?.length || 0,
        reason: slot.reason || null
      })) || [],
      waitlistAvailable: availability.waitlistAvailable || false,
      estimatedWaitTime: availability.estimatedWaitTime || null,
      nextAvailableSlot: availability.nextAvailableSlot || null,
      restrictions: availability.restrictions || [],
      message: availability.message || null
    };
  }

  static toTimeSlotResponse(timeSlots) {
    return timeSlots.map(slot => ({
      time: slot.time,
      isAvailable: slot.isAvailable,
      availableCapacity: slot.availableCapacity,
      totalCapacity: slot.totalCapacity,
      utilizationRate: slot.utilizationRate,
      availableTables: slot.availableTables || [],
      reservationsCount: slot.reservationsCount || 0,
      reasons: slot.reasons || []
    }));
  }

  static toDailyAvailabilityResponse(dailyAvailability) {
    return {
      date: dailyAvailability.date,
      isOpen: dailyAvailability.isOpen,
      operatingHours: dailyAvailability.operatingHours ? {
        openTime: dailyAvailability.operatingHours.openTime,
        closeTime: dailyAvailability.operatingHours.closeTime
      } : null,
      timeSlots: this.toTimeSlotResponse(dailyAvailability.timeSlots || []),
      totalCapacity: dailyAvailability.totalCapacity,
      reservedCapacity: dailyAvailability.reservedCapacity,
      availableCapacity: dailyAvailability.availableCapacity,
      utilizationRate: dailyAvailability.utilizationRate,
      blackoutPeriods: dailyAvailability.blackoutPeriods?.map(period => ({
        startTime: period.startTime,
        endTime: period.endTime,
        reason: period.reason
      })) || [],
      specialEvents: dailyAvailability.specialEvents || [],
      restrictions: dailyAvailability.restrictions || []
    };
  }

  static toWeeklyAvailabilityResponse(weeklyAvailability) {
    return {
      weekStart: weeklyAvailability.weekStart,
      weekEnd: weeklyAvailability.weekEnd,
      days: weeklyAvailability.days.map(day => this.toDailyAvailabilityResponse(day)),
      summary: {
        totalDaysOpen: weeklyAvailability.summary.totalDaysOpen,
        averageUtilization: weeklyAvailability.summary.averageUtilization,
        peakDay: weeklyAvailability.summary.peakDay,
        quietestDay: weeklyAvailability.summary.quietestDay,
        totalReservations: weeklyAvailability.summary.totalReservations
      }
    };
  }

  static toTableAvailabilityResponse(tableAvailability) {
    return tableAvailability.map(table => ({
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      location: table.location,
      isAvailable: table.isAvailable,
      currentReservation: table.currentReservation ? {
        id: table.currentReservation.id,
        customerName: table.currentReservation.customerName,
        startTime: table.currentReservation.startTime,
        endTime: table.currentReservation.endTime,
        partySize: table.currentReservation.partySize,
        status: table.currentReservation.status
      } : null,
      nextReservation: table.nextReservation ? {
        id: table.nextReservation.id,
        customerName: table.nextReservation.customerName,
        startTime: table.nextReservation.startTime,
        partySize: table.nextReservation.partySize
      } : null,
      utilizationToday: table.utilizationToday || 0,
      totalReservationsToday: table.totalReservationsToday || 0
    }));
  }

  static toOptimalTableResponse(optimalTables) {
    return {
      recommendedTable: optimalTables.recommendedTable ? {
        id: optimalTables.recommendedTable.id,
        name: optimalTables.recommendedTable.name,
        capacity: optimalTables.recommendedTable.capacity,
        location: optimalTables.recommendedTable.location,
        score: optimalTables.recommendedTable.score,
        reasons: optimalTables.recommendedTable.reasons || []
      } : null,
      alternativeTables: optimalTables.alternativeTables?.map(table => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        score: table.score,
        reasons: table.reasons || []
      })) || [],
      criteria: optimalTables.criteria || {
        capacityMatch: 0,
        locationPreference: 0,
        utilizationBalance: 0,
        customerHistory: 0
      }
    };
  }
}

class WaitlistDto {
  static toResponse(waitlistEntry) {
    return {
      id: waitlistEntry.id,
      customerInfo: {
        name: waitlistEntry.customerName,
        phone: waitlistEntry.customerPhone,
        email: waitlistEntry.customerEmail
      },
      partySize: waitlistEntry.partySize,
      status: waitlistEntry.status,
      priority: waitlistEntry.priority,
      estimatedWaitTime: waitlistEntry.estimatedWaitTime,
      preferredTableType: waitlistEntry.preferredTableType,
      specialRequests: waitlistEntry.specialRequests,
      notes: waitlistEntry.notes,
      position: waitlistEntry.position || null,
      notificationsSent: waitlistEntry.notificationsSent || 0,
      lastNotifiedAt: waitlistEntry.lastNotifiedAt,
      table: waitlistEntry.table ? {
        id: waitlistEntry.table.id,
        name: waitlistEntry.table.name,
        capacity: waitlistEntry.table.capacity
      } : null,
      createdAt: waitlistEntry.createdAt,
      updatedAt: waitlistEntry.updatedAt,
      seatedAt: waitlistEntry.seatedAt
    };
  }

  static toListResponse(waitlistEntries, pagination = null) {
    const data = waitlistEntries.map((entry, index) => ({
      ...this.toResponse(entry),
      position: index + 1 // Calculate position in current list
    }));
    
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
      partySize: requestData.partySize,
      preferredTableType: requestData.preferredTableType || 'any',
      specialRequests: requestData.specialRequests || null,
      priority: requestData.priority || 1,
      estimatedWaitTime: requestData.estimatedWaitTime || null,
      notes: requestData.notes || null,
      status: 'WAITING'
    };
  }
}

module.exports = {
  AvailabilityDto,
  WaitlistDto
};