'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Clock, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  ChefHat, 
  AlertTriangle,
  DollarSign,
  Filter
} from 'lucide-react'
import { useState } from 'react'

export function ActivityTimeline({ 
  serviceUpdates, 
  financialStream, 
  alerts, 
  className = "" 
}) {
  const [filter, setFilter] = useState('all')

  // Combine all activities into a single timeline
  const combineActivities = () => {
    const activities = []

    // Add service updates
    serviceUpdates.forEach(update => {
      activities.push({
        id: `service-${update.id}`,
        type: 'service',
        category: update.type,
        title: formatServiceTitle(update.type),
        description: update.details,
        table: update.table,
        timestamp: update.timestamp,
        server: update.server,
        icon: getServiceIcon(update.type),
        color: 'text-blue-400'
      })
    })

    // Add financial transactions
    financialStream.forEach(transaction => {
      if (transaction.type !== 'milestone') {
        activities.push({
          id: `financial-${transaction.id}`,
          type: 'financial',
          category: transaction.type,
          title: `${transaction.type === 'refund' ? 'Refund' : 'Payment'} Processed`,
          description: `$${Math.abs(transaction.amount).toFixed(2)} - ${transaction.paymentMethod || 'Cash'}`,
          table: transaction.table,
          timestamp: transaction.timestamp,
          server: transaction.server,
          icon: CreditCard,
          color: transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
        })
      } else {
        activities.push({
          id: `milestone-${transaction.id}`,
          type: 'milestone',
          category: 'milestone',
          title: 'Revenue Milestone',
          description: transaction.details,
          timestamp: transaction.timestamp,
          icon: DollarSign,
          color: 'text-purple-400'
        })
      }
    })

    // Add alerts (only unacknowledged ones)
    alerts.filter(alert => !alert.acknowledged).forEach(alert => {
      activities.push({
        id: `alert-${alert.id}`,
        type: 'alert',
        category: alert.category,
        title: alert.title,
        description: alert.message,
        timestamp: alert.timestamp,
        icon: AlertTriangle,
        color: alert.type === 'critical' ? 'text-red-400' : 'text-yellow-400',
        priority: alert.type
      })
    })

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => {
      const timeA = convertTimeToMinutes(a.timestamp)
      const timeB = convertTimeToMinutes(b.timestamp)
      return timeB - timeA
    })
  }

  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  const formatServiceTitle = (type) => {
    const titles = {
      table_seated: 'Table Seated',
      order_taken: 'Order Taken',
      payment_processing: 'Processing Payment',
      table_cleaning: 'Table Cleaning',
      order_delivered: 'Order Delivered',
      table_cleared: 'Table Cleared',
      customer_arrived: 'Customer Arrived',
      drink_refilled: 'Drinks Refilled',
      check_requested: 'Check Requested'
    }
    return titles[type] || 'Service Update'
  }

  const getServiceIcon = (type) => {
    const icons = {
      table_seated: Users,
      order_taken: ShoppingCart,
      payment_processing: CreditCard,
      table_cleaning: Users,
      order_delivered: ChefHat,
      table_cleared: Users,
      customer_arrived: Users,
      drink_refilled: ChefHat,
      check_requested: CreditCard
    }
    return icons[type] || Activity
  }

  const filteredActivities = combineActivities().filter(activity => {
    if (filter === 'all') return true
    return activity.type === filter
  })

  const filterOptions = [
    { value: 'all', label: 'All Activity', color: 'text-white' },
    { value: 'service', label: 'Service', color: 'text-blue-400' },
    { value: 'financial', label: 'Financial', color: 'text-green-400' },
    { value: 'alert', label: 'Alerts', color: 'text-red-400' }
  ]

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-cyan-400" />
            Activity Timeline
          </CardTitle>
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {filterOptions.map(option => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter(option.value)}
                  className={`text-xs glass border-white/10 ${
                    filter === option.value 
                      ? 'bg-white/10 border-cyan-500/30' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className={option.color}>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredActivities.map((activity, index) => {
            const ActivityIcon = activity.icon
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Timeline line */}
                {index < filteredActivities.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-8 bg-gradient-to-b from-white/20 to-transparent" />
                )}
                
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 ${activity.color}`}>
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white/90 truncate">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {activity.description}
                    </p>
                    
                    {/* Details */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {activity.table && (
                        <span>Table {activity.table}</span>
                      )}
                      {activity.server && (
                        <span className="text-cyan-400">{activity.server}</span>
                      )}
                      {activity.priority === 'critical' && (
                        <span className="text-red-400 font-medium">CRITICAL</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No {filter === 'all' ? '' : filter} activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}