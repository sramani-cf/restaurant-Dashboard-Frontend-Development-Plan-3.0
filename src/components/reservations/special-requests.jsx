import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Utensils, 
  Heart, 
  MapPin, 
  Volume2, 
  Accessibility,
  Baby,
  Gift,
  MessageSquare,
  Plus,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SpecialRequests = ({ value = {}, onChange, className }) => {
  const { dietary = [], seating = [], accessibility = [], occasion = '', notes = '' } = value
  
  const [selectedRequests, setSelectedRequests] = useState({
    dietary: dietary || [],
    seating: seating || [],
    accessibility: accessibility || [],
    occasion: occasion || '',
    notes: notes || ''
  })

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🌱', color: 'text-green-400' },
    { id: 'vegan', label: 'Vegan', icon: '🥬', color: 'text-green-400' },
    { id: 'gluten-free', label: 'Gluten Free', icon: '🌾', color: 'text-yellow-400' },
    { id: 'dairy-free', label: 'Dairy Free', icon: '🥛', color: 'text-blue-400' },
    { id: 'nut-allergy', label: 'Nut Allergy', icon: '🥜', color: 'text-red-400' },
    { id: 'kosher', label: 'Kosher', icon: '✡️', color: 'text-purple-400' },
    { id: 'halal', label: 'Halal', icon: '☪️', color: 'text-cyan-400' }
  ]

  const seatingOptions = [
    { id: 'window', label: 'Window Seat', icon: <MapPin className="h-4 w-4" />, color: 'text-blue-400' },
    { id: 'quiet', label: 'Quiet Area', icon: <Volume2 className="h-4 w-4" />, color: 'text-purple-400' },
    { id: 'booth', label: 'Booth Preferred', icon: '🪑', color: 'text-cyan-400' },
    { id: 'bar', label: 'Bar Seating', icon: '🍸', color: 'text-orange-400' }
  ]

  const accessibilityOptions = [
    { id: 'wheelchair', label: 'Wheelchair Access', icon: <Accessibility className="h-4 w-4" />, color: 'text-cyan-400' },
    { id: 'highchair', label: 'High Chair', icon: <Baby className="h-4 w-4" />, color: 'text-pink-400' },
    { id: 'large-print', label: 'Large Print Menu', icon: '📖', color: 'text-yellow-400' }
  ]

  const occasionOptions = [
    { id: 'birthday', label: 'Birthday', icon: '🎂' },
    { id: 'anniversary', label: 'Anniversary', icon: '💕' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'date', label: 'Date Night', icon: '💑' },
    { id: 'celebration', label: 'Celebration', icon: '🎉' }
  ]

  const updateSelection = (category, id, remove = false) => {
    const updated = { ...selectedRequests }
    
    if (category === 'occasion') {
      updated.occasion = remove ? '' : id
    } else {
      if (remove) {
        updated[category] = updated[category].filter(item => item !== id)
      } else {
        updated[category] = [...(updated[category] || []), id]
      }
    }
    
    setSelectedRequests(updated)
    onChange?.(updated)
  }

  const updateNotes = (newNotes) => {
    const updated = { ...selectedRequests, notes: newNotes }
    setSelectedRequests(updated)
    onChange?.(updated)
  }

  const OptionButton = ({ option, category, selected, onToggle }) => (
    <motion.button
      type="button"
      className={cn(
        "relative p-3 rounded-xl text-left transition-all duration-200 border-2",
        selected
          ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-200"
          : "bg-black/20 border-white/10 text-white hover:border-cyan-400/30 hover:bg-cyan-400/10"
      )}
      onClick={() => onToggle(category, option.id, selected)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <div className={cn("text-xl", option.color)}>
          {typeof option.icon === 'string' ? option.icon : option.icon}
        </div>
        <span className="font-medium text-sm">{option.label}</span>
      </div>
      
      {selected && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.2 }}
        >
          <X className="h-4 w-4 text-cyan-400" />
        </motion.div>
      )}
      
      {selected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-cyan-400/10 rounded-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dietary Requirements */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Utensils className="h-5 w-5 text-green-400" />
            Dietary Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietaryOptions.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                category="dietary"
                selected={selectedRequests.dietary.includes(option.id)}
                onToggle={updateSelection}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seating Preferences */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-400" />
            Seating Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {seatingOptions.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                category="seating"
                selected={selectedRequests.seating.includes(option.id)}
                onToggle={updateSelection}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-cyan-400" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {accessibilityOptions.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                category="accessibility"
                selected={selectedRequests.accessibility.includes(option.id)}
                onToggle={updateSelection}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Occasion */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-400" />
            Special Occasion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {occasionOptions.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                category="occasion"
                selected={selectedRequests.occasion === option.id}
                onToggle={updateSelection}
              />
            ))}
          </div>
          
          {selectedRequests.occasion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-pink-400/10 border border-pink-400/30"
            >
              <p className="text-sm text-pink-200">
                🎉 We'll make sure your {occasionOptions.find(o => o.id === selectedRequests.occasion)?.label.toLowerCase()} is extra special!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            label="Tell us anything else we should know..."
            placeholder="Any other special requests, allergies, or preferences..."
            value={selectedRequests.notes}
            onChange={(e) => updateNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Summary of Selected Requests */}
      <AnimatePresence>
        {(selectedRequests.dietary.length > 0 || 
          selectedRequests.seating.length > 0 || 
          selectedRequests.accessibility.length > 0 || 
          selectedRequests.occasion || 
          selectedRequests.notes) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="glass-card border-cyan-400/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-cyan-300">
                  <Heart className="h-5 w-5" />
                  Your Special Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRequests.dietary.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Dietary:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequests.dietary.map(id => {
                        const option = dietaryOptions.find(o => o.id === id)
                        return (
                          <Badge key={id} variant="secondary" className="bg-green-400/20 text-green-300">
                            {option?.icon} {option?.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {selectedRequests.seating.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Seating:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequests.seating.map(id => {
                        const option = seatingOptions.find(o => o.id === id)
                        return (
                          <Badge key={id} variant="secondary" className="bg-blue-400/20 text-blue-300">
                            {option?.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {selectedRequests.accessibility.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-cyan-400 mb-2">Accessibility:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequests.accessibility.map(id => {
                        const option = accessibilityOptions.find(o => o.id === id)
                        return (
                          <Badge key={id} variant="secondary" className="bg-cyan-400/20 text-cyan-300">
                            {option?.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {selectedRequests.occasion && (
                  <div>
                    <h4 className="text-sm font-medium text-pink-400 mb-2">Occasion:</h4>
                    <Badge variant="secondary" className="bg-pink-400/20 text-pink-300">
                      {occasionOptions.find(o => o.id === selectedRequests.occasion)?.icon} {occasionOptions.find(o => o.id === selectedRequests.occasion)?.label}
                    </Badge>
                  </div>
                )}
                
                {selectedRequests.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-purple-400 mb-2">Notes:</h4>
                    <p className="text-sm text-slate-300 p-3 rounded-lg bg-purple-400/10 border border-purple-400/30">
                      {selectedRequests.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SpecialRequests }