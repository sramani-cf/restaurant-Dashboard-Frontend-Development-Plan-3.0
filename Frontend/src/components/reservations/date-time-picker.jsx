import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DateTimePicker = ({ 
  value, 
  onChange, 
  availableSlots = [], 
  loading = false,
  className,
  restaurantId,
  partySize = 2
}) => {
  const [selectedDate, setSelectedDate] = useState(value?.date || null)
  const [selectedTime, setSelectedTime] = useState(value?.time || null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const today = new Date()

  // Generate dynamic time slots based on restaurant hours and availability
  const generateTimeSlots = useMemo(() => {
    const slots = []
    const startHour = 17 // 5:00 PM
    const endHour = 22   // 10:00 PM
    const interval = 30  // 30 minutes

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === endHour && minute > 0) break // Don't go past 10:00 PM
        
        const time12 = new Date()
        time12.setHours(hour, minute, 0, 0)
        const timeString = time12.toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })
        
        slots.push({
          time: timeString,
          hour24: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: true, // Will be updated based on availability data
          capacity: 0,     // Available table capacity
          waitTime: 0      // Estimated wait time if full
        })
      }
    }
    return slots
  }, [])

  // Update time slots with real availability data
  const timeSlots = useMemo(() => {
    return generateTimeSlots.map(slot => {
      const slotInfo = availableSlots.find(available => available.time === slot.time)
      
      if (slotInfo) {
        return {
          ...slot,
          available: slotInfo.available,
          capacity: slotInfo.capacity || 0,
          waitTime: slotInfo.waitTime || 0,
          tables: slotInfo.tables || []
        }
      }
      
      return slot
    })
  }, [generateTimeSlots, availableSlots])

  // Get availability stats for selected date
  const dateStats = useMemo(() => {
    if (!selectedDate) return null
    
    const available = timeSlots.filter(slot => slot.available).length
    const total = timeSlots.length
    const peakHours = timeSlots.filter(slot => {
      const hour = parseInt(slot.hour24.split(':')[0])
      return hour >= 19 && hour <= 20 // 7-8 PM peak hours
    })
    
    return {
      available,
      total,
      percentage: Math.round((available / total) * 100),
      peakAvailable: peakHours.filter(slot => slot.available).length,
      peakTotal: peakHours.length
    }
  }, [selectedDate, timeSlots])

  const handleDateSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day)
    if (newDate < today.setHours(0, 0, 0, 0)) return // Prevent past dates
    
    const dateString = newDate.toISOString().split('T')[0]
    setSelectedDate(dateString)
    onChange?.({ date: dateString, time: selectedTime })
  }

  const handleTimeSelect = (timeSlot) => {
    setSelectedTime(timeSlot.time)
    onChange?.({ date: selectedDate, time: timeSlot.time, timeSlot })
  }

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const isDateAvailable = (day) => {
    const checkDate = new Date(currentYear, currentMonth, day)
    return checkDate >= today.setHours(0, 0, 0, 0)
  }

  // Get time slot status with enhanced information
  const getTimeSlotStatus = (timeSlot) => {
    if (!timeSlot.available) {
      return {
        status: 'unavailable',
        className: 'text-slate-600 border-slate-700/50 cursor-not-allowed bg-slate-800/50',
        label: timeSlot.waitTime > 0 ? `${timeSlot.waitTime}min wait` : 'Full'
      }
    }
    
    if (timeSlot.capacity <= 2) {
      return {
        status: 'limited',
        className: 'text-orange-300 border-orange-500/50 hover:border-orange-400/80 hover:bg-orange-400/10',
        label: `${timeSlot.capacity} tables left`
      }
    }
    
    return {
      status: 'available',
      className: 'text-white border-white/10 hover:border-purple-400/50 hover:bg-purple-400/10',
      label: `${timeSlot.capacity} available`
    }
  }

  const renderCalendar = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && 
                     today.getMonth() === currentMonth && 
                     today.getFullYear() === currentYear
      const isSelected = selectedDate === new Date(currentYear, currentMonth, day).toISOString().split('T')[0]
      const isAvailable = isDateAvailable(day)
      
      days.push(
        <motion.button
          key={day}
          type="button"
          className={cn(
            "relative p-2 h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200",
            isAvailable
              ? "text-white hover:bg-cyan-400/20 hover:text-cyan-300"
              : "text-slate-600 cursor-not-allowed",
            isSelected && "bg-cyan-400/30 text-cyan-200 ring-2 ring-cyan-400/50",
            isToday && "border border-cyan-400/50"
          )}
          onClick={() => isAvailable && handleDateSelect(day)}
          disabled={!isAvailable}
          whileHover={isAvailable ? { scale: 1.05 } : {}}
          whileTap={isAvailable ? { scale: 0.95 } : {}}
        >
          {day}
          {isToday && (
            <motion.div
              className="absolute bottom-0 left-1/2 w-1 h-1 bg-cyan-400 rounded-full transform -translate-x-1/2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>
      )
    }
    
    return days
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Date Selection */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold text-cyan-300">
              {months[currentMonth]} {currentYear}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Week headers */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-xs font-medium text-slate-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Selection */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-400" />
                    Select Time
                  </CardTitle>
                  {loading && (
                    <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                  )}
                </div>
                {dateStats && (
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-300">{dateStats.available}/{dateStats.total} slots available</span>
                    </div>
                    <div className="text-muted-foreground">
                      Peak hours: {dateStats.peakAvailable}/{dateStats.peakTotal}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {timeSlots.map((timeSlot) => {
                    const slotStatus = getTimeSlotStatus(timeSlot)
                    const selected = selectedTime === timeSlot.time
                    
                    return (
                      <motion.button
                        key={timeSlot.time}
                        type="button"
                        className={cn(
                          "relative p-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[60px] flex flex-col items-center justify-center",
                          slotStatus.className,
                          selected && "bg-purple-400/20 border-purple-400/50 text-purple-200 ring-2 ring-purple-400/30"
                        )}
                        onClick={() => timeSlot.available && handleTimeSelect(timeSlot)}
                        disabled={!timeSlot.available || loading}
                        whileHover={timeSlot.available && !loading ? { scale: 1.02 } : {}}
                        whileTap={timeSlot.available && !loading ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="font-semibold">{timeSlot.time}</span>
                        
                        {/* Availability indicator */}
                        <span className="text-xs mt-1 opacity-80">
                          {timeSlot.available ? (
                            timeSlot.capacity > 0 ? `${timeSlot.capacity} tables` : 'Available'
                          ) : (
                            timeSlot.waitTime > 0 ? `${timeSlot.waitTime}m wait` : 'Full'
                          )}
                        </span>
                        
                        {selected && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-cyan-400/20 to-purple-400/20 rounded-lg"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                        
                        {/* Status indicators */}
                        {!timeSlot.available && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        )}
                        
                        {timeSlot.available && timeSlot.capacity <= 2 && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        )}
                        
                        {loading && (
                          <div className="absolute inset-0 bg-slate-900/50 rounded-lg flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                {/* No available slots message */}
                {timeSlots.length > 0 && timeSlots.every(slot => !slot.available) && !loading && (
                  <div className="mt-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 text-orange-400" />
                    <p className="text-sm text-orange-300 mb-2">No availability for {partySize} guests</p>
                    <p className="text-xs text-muted-foreground">
                      Try selecting a different date or reducing party size
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {loading && timeSlots.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-cyan-400" />
                      <p className="text-sm text-muted-foreground">Loading available times...</p>
                    </div>
                  </div>
                )}
                
                {selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-400/10 via-cyan-400/10 to-purple-400/10 border border-purple-400/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-200">
                          {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })} at {selectedTime}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Party of {partySize} • Duration: 2 hours
                        </p>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const currentSlot = timeSlots.find(slot => slot.time === selectedTime)
                          if (!currentSlot) return null
                          
                          return (
                            <div className="text-xs">
                              {currentSlot.capacity > 0 && (
                                <div className="text-green-400">{currentSlot.capacity} tables available</div>
                              )}
                              {currentSlot.waitTime > 0 && (
                                <div className="text-orange-400">{currentSlot.waitTime}min estimated wait</div>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { DateTimePicker }