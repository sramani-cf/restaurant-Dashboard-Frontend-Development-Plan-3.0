import React, { useState, useEffect } from 'react'
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
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DateTimePicker } from './date-time-picker'
import { PartySize } from './party-size-selector'
import { SpecialRequests } from './special-requests'
import { ReservationSummary } from './reservation-summary'
import { TABLE_STATUSES } from '@/constants/demo-data'
import { cn } from '@/lib/utils'

const NewReservationModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    tablePreference: 'auto'
  })

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
      title: 'Date & Time',
      icon: Calendar,
      description: 'When would you like to dine?',
      color: 'text-purple-400'
    },
    {
      id: 'party',
      title: 'Party Size',
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

  const availableTables = TABLE_STATUSES.filter(table => 
    table.status === 'available' && table.seats >= formData.partySize
  )

  // Auto-select best table based on party size
  const getOptimalTable = () => {
    const sortedTables = availableTables.sort((a, b) => {
      const aDiff = Math.abs(a.seats - formData.partySize)
      const bDiff = Math.abs(b.seats - formData.partySize)
      return aDiff - bDiff
    })
    return sortedTables[0]?.number || 'auto'
  }

  useEffect(() => {
    if (formData.partySize && availableTables.length > 0) {
      setFormData(prev => ({
        ...prev,
        tablePreference: getOptimalTable()
      }))
    }
  }, [formData.partySize])

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
        return formData.dateTime.date && formData.dateTime.time
      case 2: // Party Size
        return formData.partySize > 0
      case 3: // Special Requests
        return true // Optional step
      case 4: // Summary
        return true
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
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create new reservation object
      const newReservation = {
        id: Date.now(),
        name: formData.customerInfo.name,
        phone: formData.customerInfo.phone,
        email: formData.customerInfo.email,
        time: formData.dateTime.time,
        date: formData.dateTime.date,
        guests: formData.partySize,
        table: formData.tablePreference === 'auto' ? getOptimalTable() : formData.tablePreference,
        status: 'confirmed',
        specialRequests: formData.specialRequests
      }

      onSuccess?.(newReservation)
      onClose()
      
      // Reset form
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
        tablePreference: 'auto'
      })
      setCurrentStep(0)
      
    } catch (error) {
      console.error('Error creating reservation:', error)
    } finally {
      setIsSubmitting(false)
    }
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
            <Input
              label="Full Name *"
              placeholder="Enter customer name"
              value={formData.customerInfo.name}
              onChange={(e) => updateFormData('customerInfo', { name: e.target.value })}
            />
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
          >
            <DateTimePicker
              value={formData.dateTime}
              onChange={(value) => updateNestedFormData('dateTime', value)}
              availableSlots={[]} // Add logic for blocked time slots
            />
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="party"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PartySize
              value={formData.partySize}
              onChange={(value) => updateNestedFormData('partySize', value)}
              maxSize={12}
            />
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
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 mb-2",
                        index <= currentStep
                          ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
                          : "border-slate-600 bg-slate-800 text-slate-500"
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
                
                {/* Progress Line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-600 -z-10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
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
              </div>

              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                variant={canProceed() ? "default" : "outline"}
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