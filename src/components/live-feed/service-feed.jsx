'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  CheckCircle, 
  ShoppingCart, 
  CreditCard, 
  Clock, 
  Utensils,
  UserCheck,
  Trash2
} from 'lucide-react'

export function ServiceFeed({ updates, className = "" }) {
  const getUpdateIcon = (type) => {
    switch (type) {
      case 'table_seated': return Users
      case 'order_taken': return ShoppingCart
      case 'payment_processing': return CreditCard
      case 'table_cleaning': return Trash2
      case 'order_delivered': return Utensils
      case 'table_cleared': return CheckCircle
      case 'customer_arrived': return UserCheck
      case 'drink_refilled': return Utensils
      case 'check_requested': return CreditCard
      default: return Clock
    }
  }

  const getUpdateColor = (type) => {
    switch (type) {
      case 'table_seated': return 'text-green-400'
      case 'order_taken': return 'text-blue-400'
      case 'payment_processing': return 'text-yellow-400'
      case 'table_cleaning': return 'text-purple-400'
      case 'order_delivered': return 'text-green-400'
      case 'table_cleared': return 'text-cyan-400'
      case 'customer_arrived': return 'text-green-400'
      case 'drink_refilled': return 'text-blue-400'
      case 'check_requested': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getBadgeColor = (type) => {
    switch (type) {
      case 'table_seated': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'order_taken': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'payment_processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'table_cleaning': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'order_delivered': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'table_cleared': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'customer_arrived': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'drink_refilled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'check_requested': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatUpdateType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-blue-400" />
          Service Operations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {updates.map((update, index) => {
            const UpdateIcon = getUpdateIcon(update.type)
            const updateColor = getUpdateColor(update.type)
            
            return (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UpdateIcon className={`h-4 w-4 ${updateColor}`} />
                    <Badge className={getBadgeColor(update.type)}>
                      {formatUpdateType(update.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {update.timestamp}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-2">
                  <p className="text-sm text-white/90 mb-1">
                    {update.details}
                  </p>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Table {update.table}</span>
                    {update.guests && (
                      <span>{update.guests} guests</span>
                    )}
                    {update.amount && (
                      <span className="text-green-400 font-medium">
                        ${update.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-cyan-400">
                    {update.server}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {updates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent service updates</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}