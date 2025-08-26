import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  MapPin,
  CheckCircle,
  Edit3,
  Utensils,
  Heart,
  Gift,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const ReservationSummary = ({ 
  formData, 
  onEdit, 
  onConfirm, 
  isConfirming = false,
  className 
}) => {
  const {
    customerInfo = {},
    dateTime = {},
    partySize = 1,
    specialRequests = {},
    tablePreference = 'auto'
  } = formData

  const formatDate = (dateString) => {
    if (!dateString) return 'Not selected'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'Not selected'
    return timeString
  }

  const getGuestLabel = (count) => {
    if (count === 1) return '1 Guest'
    return `${count} Guests`
  }

  const getSectionIcon = (section) => {
    const icons = {
      customer: <User className="h-5 w-5" />,
      datetime: <Calendar className="h-5 w-5" />,
      party: <Users className="h-5 w-5" />,
      requests: <Heart className="h-5 w-5" />
    }
    return icons[section] || null
  }

  const renderRequests = () => {
    const { dietary = [], seating = [], accessibility = [], occasion = '', notes = '' } = specialRequests
    
    if (!dietary.length && !seating.length && !accessibility.length && !occasion && !notes) {
      return <span className="text-slate-400 text-sm">No special requests</span>
    }

    return (
      <div className="space-y-3">
        {dietary.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-green-400 mb-1 flex items-center gap-1">
              <Utensils className="h-3 w-3" />
              Dietary
            </h5>
            <div className="flex flex-wrap gap-1">
              {dietary.map(item => (
                <Badge key={item} variant="secondary" className="bg-green-400/20 text-green-300 text-xs">
                  {item.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {seating.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-blue-400 mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Seating
            </h5>
            <div className="flex flex-wrap gap-1">
              {seating.map(item => (
                <Badge key={item} variant="secondary" className="bg-blue-400/20 text-blue-300 text-xs">
                  {item.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {accessibility.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-cyan-400 mb-1">Accessibility</h5>
            <div className="flex flex-wrap gap-1">
              {accessibility.map(item => (
                <Badge key={item} variant="secondary" className="bg-cyan-400/20 text-cyan-300 text-xs">
                  {item.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {occasion && (
          <div>
            <h5 className="text-xs font-medium text-pink-400 mb-1 flex items-center gap-1">
              <Gift className="h-3 w-3" />
              Occasion
            </h5>
            <Badge variant="secondary" className="bg-pink-400/20 text-pink-300 text-xs">
              {occasion}
            </Badge>
          </div>
        )}
        
        {notes && (
          <div>
            <h5 className="text-xs font-medium text-purple-400 mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Notes
            </h5>
            <p className="text-xs text-slate-300 p-2 rounded bg-purple-400/10 border border-purple-400/30">
              {notes}
            </p>
          </div>
        )}
      </div>
    )
  }

  const summaryItems = [
    {
      id: 'customer',
      title: 'Customer Information',
      icon: getSectionIcon('customer'),
      color: 'text-cyan-400',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-sm">{customerInfo.name || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400" />
            <span className="text-sm">{customerInfo.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="text-sm">{customerInfo.email || 'Not provided'}</span>
          </div>
        </div>
      )
    },
    {
      id: 'datetime',
      title: 'Date & Time',
      icon: getSectionIcon('datetime'),
      color: 'text-purple-400',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm">{formatDate(dateTime.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm">{formatTime(dateTime.time)}</span>
          </div>
        </div>
      )
    },
    {
      id: 'party',
      title: 'Party Details',
      icon: getSectionIcon('party'),
      color: 'text-green-400',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-sm">{getGuestLabel(partySize)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-sm">
              {tablePreference === 'auto' ? 'Auto-assign table' : `Table ${tablePreference}`}
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'requests',
      title: 'Special Requests',
      icon: getSectionIcon('requests'),
      color: 'text-pink-400',
      content: renderRequests()
    }
  ]

  const isComplete = customerInfo.name && customerInfo.phone && dateTime.date && dateTime.time

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="glass-card border-cyan-400/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2 text-cyan-300">
            <CheckCircle className="h-6 w-6" />
            Reservation Summary
          </CardTitle>
          <p className="text-sm text-slate-400">
            Please review your reservation details before confirming
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {summaryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("text-lg", item.color)}>
                        {item.icon}
                      </div>
                      <h4 className="font-medium text-white">{item.title}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(item.id)}
                      className="h-8 w-8 p-0 hover:bg-white/10"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                  {item.content}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Confirmation Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200",
              isComplete
                ? "bg-green-400/10 border-green-400/30"
                : "bg-yellow-400/10 border-yellow-400/30"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isComplete ? "bg-green-400" : "bg-yellow-400"
              )}>
                <motion.div
                  className={cn(
                    "w-full h-full rounded-full",
                    isComplete ? "bg-green-400" : "bg-yellow-400"
                  )}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className={cn(
                "font-medium text-sm",
                isComplete ? "text-green-300" : "text-yellow-300"
              )}>
                {isComplete ? "Ready to confirm" : "Missing required information"}
              </span>
            </div>
            <p className={cn(
              "text-xs",
              isComplete ? "text-green-400" : "text-yellow-400"
            )}>
              {isComplete
                ? "All required information has been provided. You can now confirm your reservation."
                : "Please provide customer name, phone number, date, and time to continue."
              }
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onEdit?.('customer')}
              className="flex-1"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!isComplete || isConfirming}
              className="flex-1"
              variant={isComplete ? "neon" : "ghost"}
            >
              {isConfirming ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"
                  />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Reservation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { ReservationSummary }