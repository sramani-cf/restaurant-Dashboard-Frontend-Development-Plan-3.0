import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Calendar,
  Users,
  Heart,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DateTimePicker } from './date-time-picker'
import { PartySize } from './party-size-selector'
import { SpecialRequests } from './special-requests'
import { ReservationSummary } from './reservation-summary'
import reservationService from '@/services/reservationService'
import { cn } from '@/lib/utils'

const NewReservationModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableTables, setAvailableTables] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [customerSuggestions, setCustomerSuggestions] = useState([])
  
  const [formData, setFormData] = useState({
    customerInfo: {
      name: '',
      phone: '',
      email: ''
    },
    dateTime: {
      date: null,
      time: null
    },
    partySize: 2,
    specialRequests: {
      dietary: [],
      seating: [],
      accessibility: [],
      occasion: '',
      notes: ''
    },
    tablePreference: 'auto',
    duration: 120 // Default 2 hours
  })

  // Get restaurant ID
  const restaurantId = process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_ID || 'demo-restaurant-id'

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && currentStep === 0) {
      const firstInput = document.querySelector('input[type="text"]')
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100)
      }
    }
  }, [isOpen, currentStep])

  const steps = [
    {
      id: 'customer',
      title: 'Customer Information',
      icon: User,
      description: 'Tell us who\'s joining us',
      color: 'text-cyan-400'
    },
    {
      id: 'datetime',
      title: 'Date & Time fix',
      icon: Calendar,
      description: 'When would you like to dine?',
      color: 'text-purple-400'
    },
    {
      id: 'party',
      title: 'Party Size Members',
      icon: Users,
      description: 'How many guests?',
      color: 'text-green-400'
    },
    {
      id: 'requests',
      title: 'Special Requests',
      icon: Heart,
      description: 'Any special requirements?',
      color: 'text-pink-400'
    },
    {
      id: 'summary',
      title: 'Review & Confirm',
      icon: CheckCircle,
      description: 'Finalize your reservation',
      color: 'text-cyan-400'
    }
  ]

  // Real-time availability checking
  const checkAvailability = useCallback(async () => {
    if (!formData.dateTime.date || !formData.dateTime.time || !formData.partySize) {
      return
    }

    setAvailabilityLoading(true)
    setError(null)

    try {
      const availabilityData = await reservationService.checkAvailability(restaurantId, {
        date: formData.dateTime.date,
        time: formData.dateTime.time,
        partySize: formData.partySize,
        duration: formData.duration
      })

      setAvailableTables(availabilityData.availableTables || [])
      setAvailableSlots(availabilityData.alternativeSlots || [])
      
      // Check for conflicts
      if (formData.dateTime.date && formData.dateTime.time) {
        const conflictData = await reservationService.checkConflicts(restaurantId, {
          date: formData.dateTime.date,
          time: formData.dateTime.time,
          partySize: formData.partySize,
          duration: formData.duration
        })
        
        setConflicts(conflictData.conflicts || [])
      }

    } catch (error) {
      console.error('Error checking availability:', error)
      setError('Unable to check availability. Please try again.')
    } finally {
      setAvailabilityLoading(false)
    }
  }, [restaurantId, formData.dateTime, formData.partySize, formData.duration])

  // Auto-select best table based on party size and availability
  const getOptimalTable = useCallback(() => {
    if (!availableTables.length) return 'auto'
    
    const sortedTables = [...availableTables].sort((a, b) => {
      const aDiff = Math.abs(a.seats - formData.partySize)
      const bDiff = Math.abs(b.seats - formData.partySize)
      return aDiff - bDiff
    })
    return sortedTables[0]?.id || 'auto'
  }, [availableTables, formData.partySize])

  // Customer search functionality
  const searchCustomers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setCustomerSuggestions([])
      return
    }

    try {
      const results = await reservationService.searchCustomers(query)
      setCustomerSuggestions(results.customers || [])
    } catch (error) {
      console.error('Error searching customers:', error)
    }
  }, [])

  // Load available slots when date/party size changes
  useEffect(() => {
    if (formData.dateTime.date && formData.partySize) {
      loadAvailableSlots()
    }
  }, [formData.dateTime.date, formData.partySize])

  const loadAvailableSlots = async () => {
    try {
      const slotsData = await reservationService.getAvailableSlots(
        restaurantId,
        formData.dateTime.date,
        formData.partySize
      )
      setAvailableSlots(slotsData.slots || [])
    } catch (error) {
      console.error('Error loading available slots:', error)
    }
  }

  // Check availability when time is selected
  useEffect(() => {
    if (formData.dateTime.date && formData.dateTime.time) {
      const timer = setTimeout(checkAvailability, 500) // Debounce
      return () => clearTimeout(timer)
    }
  }, [formData.dateTime, formData.partySize, checkAvailability])

  // Auto-assign optimal table
  useEffect(() => {
    if (availableTables.length > 0) {
      setFormData(prev => ({
        ...prev,
        tablePreference: getOptimalTable()
      }))
    }
  }, [availableTables, getOptimalTable])

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], ...value }
    }))
  }

  const updateNestedFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Customer info
        return formData.customerInfo.name && formData.customerInfo.phone
      case 1: // Date & Time
        return formData.dateTime.date && formData.dateTime.time && !availabilityLoading && conflicts.length === 0
      case 2: // Party Size
        return formData.partySize > 0 && availableTables.length > 0
      case 3: // Special Requests
        return true // Optional step
      case 4: // Summary
        return availableTables.length > 0 && conflicts.length === 0
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex)
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    setIsSubmitting(true)
    setError(null)
    
    try {
      // Final availability check before submission
      await checkAvailability()
      
      if (conflicts.length > 0) {
        setError('Conflicts detected. Please resolve before confirming.')
        return
      }

      if (availableTables.length === 0) {
        setError('No tables available for the selected time. Please choose a different time.')
        return
      }

      // Prepare reservation data
      const reservationData = {
        customerInfo: formData.customerInfo,
        date: formData.dateTime.date,
        time: formData.dateTime.time,
        partySize: formData.partySize,
        duration: formData.duration,
        tableId: formData.tablePreference === 'auto' ? getOptimalTable() : formData.tablePreference,
        specialRequests: formData.specialRequests.notes ? {
          dietary: formData.specialRequests.dietary,
          seating: formData.specialRequests.seating,
          accessibility: formData.specialRequests.accessibility,
          occasion: formData.specialRequests.occasion,
          notes: formData.specialRequests.notes
        } : null,
        source: 'dashboard'
      }

      // Create reservation via API
      const newReservation = await reservationService.createReservation(restaurantId, reservationData)

      // Success callback
      await onSuccess?.(newReservation)
      onClose()
      
      // Reset form
      resetForm()
      
    } catch (error) {
      console.error('Error creating reservation:', error)
      setError(error.message || 'Failed to create reservation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      customerInfo: { name: '', phone: '', email: '' },
      dateTime: { date: null, time: null },
      partySize: 2,
      specialRequests: {
        dietary: [],
        seating: [],
        accessibility: [],
        occasion: '',
        notes: ''
      },
      tablePreference: 'auto',
      duration: 120
    })
    setCurrentStep(0)
    setAvailableTables([])
    setAvailableSlots([])
    setConflicts([])
    setCustomerSuggestions([])
    setError(null)
  }

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone || '',
        email: customer.email || ''
      }
    }))
    setCustomerSuggestions([])
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="customer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="relative">
              <Input
                label="Full Name *"
                placeholder="Enter customer name"
                value={formData.customerInfo.name}
                onChange={(e) => {
                  updateFormData('customerInfo', { name: e.target.value })
                  searchCustomers(e.target.value)
                }}
              />
              {/* Customer suggestions dropdown */}
              {customerSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
                >
                  {customerSuggestions.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full text-left p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      {customer.totalVisits > 0 && (
                        <p className="text-xs text-cyan-400">{customer.totalVisits} previous visits</p>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <Input
              label="Phone Number *"
              placeholder="(555) 123-4567"
              type="tel"
              value={formData.customerInfo.phone}
              onChange={(e) => updateFormData('customerInfo', { phone: e.target.value })}
            />
            <Input
              label="Email Address"
              placeholder="customer@email.com"
              type="email"
              value={formData.customerInfo.email}
              onChange={(e) => updateFormData('customerInfo', { email: e.target.value })}
            />
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            key="datetime"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <DateTimePicker
              value={formData.dateTime}
              onChange={(value) => updateNestedFormData('dateTime', value)}
              availableSlots={availableSlots}
              loading={availabilityLoading}
            />
            
            {/* Availability Status */}
            {formData.dateTime.date && formData.dateTime.time && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {availabilityLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-sm text-blue-300">Checking availability...</span>
                  </div>
                )}
                
                {!availabilityLoading && conflicts.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-300">Conflicts Detected</span>
                    </div>
                    <div className="space-y-1">
                      {conflicts.map((conflict, index) => (
                        <p key={index} className="text-xs text-red-400">{conflict.message}</p>
                      ))}
                    </div>
                    {availableSlots.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Suggested times:</p>
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.slice(0, 4).map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => updateNestedFormData('dateTime', { 
                                ...formData.dateTime, 
                                time: slot.time 
                              })}
                              className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 transition-colors"
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!availabilityLoading && conflicts.length === 0 && availableTables.length > 0 && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-300">
                        {availableTables.length} table{availableTables.length > 1 ? 's' : ''} available
                      </span>
                    </div>
                  </div>
                )}
                
                {!availabilityLoading && availableTables.length === 0 && conflicts.length === 0 && (
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-orange-300">No tables available at this time</span>
                    </div>
                    {availableSlots.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Try these times:</p>
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.slice(0, 4).map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => updateNestedFormData('dateTime', { 
                                ...formData.dateTime, 
                                time: slot.time 
                              })}
                              className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded hover:bg-cyan-500/30 transition-colors"
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="party"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <PartySize
              value={formData.partySize}
              onChange={(value) => updateNestedFormData('partySize', value)}
              maxSize={12}
              availableTables={availableTables}
            />
            
            {/* Table capacity information */}
            {availableTables.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-slate-800/50 border border-white/10"
              >
                <h4 className="font-medium mb-2 text-cyan-300">Available Tables</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableTables.slice(0, 6).map((table) => (
                    <div
                      key={table.id}
                      className={`p-2 rounded text-center text-sm border transition-colors ${
                        table.id === formData.tablePreference
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                          : 'border-white/20 bg-white/5 text-muted-foreground hover:border-white/30'
                      }`}
                      onClick={() => updateNestedFormData('tablePreference', table.id)}
                    >
                      <div className="font-medium">Table {table.number}</div>
                      <div className="text-xs">{table.seats} seats</div>
                      {table.section && (
                        <div className="text-xs opacity-70">{table.section}</div>
                      )}
                    </div>
                  ))}
                </div>
                
                {formData.tablePreference === 'auto' && (
                  <div className="mt-3 p-2 rounded bg-cyan-500/10 text-center">
                    <p className="text-sm text-cyan-300">
                      Auto-assign optimal table: Table {availableTables.find(t => t.id === getOptimalTable())?.number || 'TBD'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
            
            {availableTables.length === 0 && formData.dateTime.date && formData.dateTime.time && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center"
              >
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-orange-400" />
                <p className="text-sm text-orange-300 mb-2">
                  No tables can accommodate {formData.partySize} guests at the selected time
                </p>
                <p className="text-xs text-muted-foreground">
                  Try reducing party size or selecting a different time
                </p>
              </motion.div>
            )}
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <SpecialRequests
              value={formData.specialRequests}
              onChange={(value) => updateNestedFormData('specialRequests', value)}
            />
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ReservationSummary
              formData={formData}
              onEdit={goToStep}
              onConfirm={handleSubmit}
              isConfirming={isSubmitting}
            />
          </motion.div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <Card className="glass-card border-cyan-400/30 bg-slate-900/95 backdrop-blur-xl">
          {/* Header */}
          <CardHeader className="border-b border-white/10 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-2 rounded-xl bg-gradient-to-r from-cyan-400/20 to-purple-400/20 border border-cyan-400/30"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    New Reservation
                  </CardTitle>
                  <p className="text-slate-400 text-sm mt-1">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex items-center justify-between relative">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <motion.button
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 mb-2",
                        index < currentStep
                          ? "bg-cyan-400 text-slate-900 border-2 border-cyan-400"
                          : index === currentStep
                          ? "border-2 border-cyan-400 bg-slate-800 text-cyan-300"
                          : "border-2 border-slate-600 bg-slate-800 text-slate-500"
                      )}
                      onClick={() => goToStep(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <step.icon className="h-4 w-4" />
                    </motion.button>
                    <span className={cn(
                      "text-xs font-medium max-w-20 text-center",
                      index <= currentStep ? "text-cyan-300" : "text-slate-500"
                    )}>
                      {step.title}
                    </span>
                  </div>
                ))}
                
                {/* Progress Line - only shows completed progress */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-600 -z-10">
                  <motion.div
                    className="h-full bg-cyan-400"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: currentStep === 0 ? "0%" : `${(currentStep / (steps.length - 1)) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </CardContent>

          {/* Error Display */}
          {error && (
            <div className="border-t border-white/10 p-4 bg-red-500/10">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          {currentStep < 4 && (
            <div className="border-t border-white/10 p-6 flex items-center justify-between bg-slate-900/50">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  Step {currentStep + 1} of {steps.length}
                </span>
                {availabilityLoading && currentStep === 1 && (
                  <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                )}
              </div>

              <Button
                onClick={nextStep}
                disabled={!canProceed() || availabilityLoading}
                variant={canProceed() && !availabilityLoading ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>

      </motion.div>
    </div>
  )
}

export { NewReservationModal }