import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  Calendar, 
  MapPin, 
  X, 
  CheckCircle, 
  RefreshCw,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const ConflictResolutionModal = ({
  isOpen,
  onClose,
  conflicts = [],
  suggestedTimes = [],
  originalRequest,
  onResolve,
  onAddToWaitlist,
  loading = false
}) => {
  const [selectedResolution, setSelectedResolution] = useState(null)
  const [resolutionType, setResolutionType] = useState(null) // 'time', 'table', 'waitlist'

  useEffect(() => {
    if (isOpen) {
      setSelectedResolution(null)
      setResolutionType(null)
    }
  }, [isOpen])

  const handleSelectTime = (timeSlot) => {
    setSelectedResolution(timeSlot)
    setResolutionType('time')
  }

  const handleSelectTable = (table) => {
    setSelectedResolution(table)
    setResolutionType('table')
  }

  const handleAddToWaitlist = () => {
    setResolutionType('waitlist')
    onAddToWaitlist?.({
      ...originalRequest,
      reason: 'No available slots for preferred time'
    })
  }

  const handleResolve = () => {
    if (!selectedResolution) return

    const resolution = {
      type: resolutionType,
      data: selectedResolution,
      originalRequest
    }

    onResolve?.(resolution)
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    
    try {
      const time = new Date(`1970-01-01T${timeString}`)
      return time.toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    } catch {
      return timeString
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getConflictSeverity = (conflict) => {
    const timeDiff = Math.abs(
      new Date(`1970-01-01T${conflict.time}`) - 
      new Date(`1970-01-01T${originalRequest?.time || '00:00'}`)
    ) / 60000 // minutes

    if (timeDiff <= 30) return 'high'
    if (timeDiff <= 60) return 'medium'
    return 'low'
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'medium': return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
      case 'low': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Booking Conflict Detected</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Choose how to resolve the scheduling conflict
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Original Request Summary */}
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-medium text-white mb-4">Original Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="text-sm font-medium text-white">
                      {formatDate(originalRequest?.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-slate-400">Time</p>
                    <p className="text-sm font-medium text-white">
                      {formatTime(originalRequest?.time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                  <Users className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-xs text-slate-400">Party Size</p>
                    <p className="text-sm font-medium text-white">
                      {originalRequest?.partySize} guests
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                  <MapPin className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="text-sm font-medium text-white">
                      {originalRequest?.duration || 120} min
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conflicts Section */}
            {conflicts && conflicts.length > 0 && (
              <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  Conflicting Reservations ({conflicts.length})
                </h3>
                <div className="space-y-3">
                  {conflicts.map((conflict, index) => {
                    const severity = getConflictSeverity(conflict)
                    return (
                      <motion.div
                        key={conflict.id || index}
                        className={cn(
                          "p-4 rounded-lg border",
                          getSeverityColor(severity)
                        )}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">{conflict.customerName}</p>
                              <p className="text-sm opacity-80">{conflict.phone}</p>
                            </div>
                            <Badge variant="outline" className={getSeverityColor(severity)}>
                              {severity} conflict
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {formatTime(conflict.time)} • {conflict.partySize} guests
                            </p>
                            <p className="text-xs opacity-80">
                              Table {conflict.tableNumber || 'TBA'} • {conflict.duration}min
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Resolution Options */}
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-medium text-white">Resolution Options</h3>

              {/* Suggested Alternative Times */}
              {suggestedTimes && suggestedTimes.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-400" />
                      Alternative Time Slots
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {suggestedTimes.map((timeSlot, index) => (
                        <motion.button
                          key={index}
                          className={cn(
                            "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                            "border-2 text-center",
                            selectedResolution?.time === timeSlot.time && resolutionType === 'time'
                              ? "border-purple-400/50 bg-purple-400/20 text-purple-200"
                              : "border-slate-700/50 bg-slate-800/30 text-white hover:border-purple-400/30 hover:bg-purple-400/10"
                          )}
                          onClick={() => handleSelectTime(timeSlot)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="font-semibold">{timeSlot.time}</div>
                          {timeSlot.available && (
                            <div className="text-xs mt-1 text-green-400">Available</div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Waitlist Option */}
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <RefreshCw className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Add to Waitlist</h4>
                        <p className="text-sm text-slate-400">
                          We'll notify you when a table becomes available
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={resolutionType === 'waitlist' ? 'default' : 'outline'}
                      onClick={handleAddToWaitlist}
                      className={cn(
                        resolutionType === 'waitlist' &&
                        "bg-orange-500/20 border-orange-400/50 text-orange-200"
                      )}
                    >
                      Add to Waitlist
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Alternative Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="p-3 rounded-lg bg-blue-500/20 w-fit mx-auto mb-3">
                        <Calendar className="h-6 w-6 text-blue-400" />
                      </div>
                      <h4 className="font-medium text-white mb-2">Try Different Date</h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Select a different date with better availability
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onClose?.()}
                        className="w-full"
                      >
                        Change Date
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="p-3 rounded-lg bg-green-500/20 w-fit mx-auto mb-3">
                        <Users className="h-6 w-6 text-green-400" />
                      </div>
                      <h4 className="font-medium text-white mb-2">Modify Party Size</h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Smaller parties may have more options
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onClose?.()}
                        className="w-full"
                      >
                        Adjust Size
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                {selectedResolution ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Resolution selected
                  </span>
                ) : (
                  "Please select a resolution option"
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResolve}
                  disabled={!selectedResolution || loading || resolutionType === 'waitlist'}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export { ConflictResolutionModal }