import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DateTimePicker = ({ value, onChange, availableSlots = [], className }) => {
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

  // Generate time slots (5:00 PM to 10:00 PM in 30-minute intervals)
  const timeSlots = [
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'
  ]

  const handleDateSelect = (day) => {
    const newDate = new Date(currentYear, currentMonth, day)
    if (newDate < today.setHours(0, 0, 0, 0)) return // Prevent past dates
    
    const dateString = newDate.toISOString().split('T')[0]
    setSelectedDate(dateString)
    onChange?.({ date: dateString, time: selectedTime })
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    onChange?.({ date: selectedDate, time })
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

  const isTimeAvailable = (time) => {
    if (!selectedDate) return true
    const slotKey = `${selectedDate}_${time}`
    return !availableSlots.includes(slotKey) // Assuming availableSlots contains unavailable slots
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                  Select Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((time) => {
                    const available = isTimeAvailable(time)
                    const selected = selectedTime === time
                    
                    return (
                      <motion.button
                        key={time}
                        type="button"
                        className={cn(
                          "relative p-3 rounded-lg text-sm font-medium transition-all duration-200",
                          available
                            ? "text-white border border-white/10 hover:border-purple-400/50 hover:bg-purple-400/10"
                            : "text-slate-600 border border-slate-700/50 cursor-not-allowed",
                          selected && "bg-purple-400/20 border-purple-400/50 text-purple-200"
                        )}
                        onClick={() => available && handleTimeSelect(time)}
                        disabled={!available}
                        whileHover={available ? { scale: 1.02 } : {}}
                        whileTap={available ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {time}
                        
                        {selected && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-cyan-400/20 to-purple-400/20 rounded-lg"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                        
                        {!available && (
                          <div className="absolute inset-0 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-red-400">Full</span>
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
                
                {selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-lg bg-purple-400/10 border border-purple-400/30"
                  >
                    <p className="text-sm text-purple-200">
                      Selected: {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                    </p>
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