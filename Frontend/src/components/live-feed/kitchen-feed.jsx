'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  ChefHat, 
  AlertTriangle, 
  CheckCircle, 
  Timer,
  Users
} from 'lucide-react'

export function KitchenFeed({ orders, className = "" }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cooking': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'plating': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'normal': return 'text-green-400'
      case 'low': return 'text-gray-400'
      default: return 'text-green-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock
      case 'cooking': return ChefHat
      case 'plating': return Timer
      case 'ready': return CheckCircle
      default: return Clock
    }
  }

  const isOrderDelayed = (order) => {
    return order.elapsed > order.estimatedTime * 1.1
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ChefHat className="h-5 w-5 text-orange-400" />
          Kitchen Operations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map((order, index) => {
            const StatusIcon = getStatusIcon(order.status)
            const isDelayed = isOrderDelayed(order)
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border border-white/10 bg-white/5 ${
                  isDelayed ? 'border-red-500/30 bg-red-500/5' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {order.status}
                    </Badge>
                    <span className="text-sm font-medium">Order {order.id}</span>
                    {isDelayed && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Table {order.table}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">Items:</p>
                  <div className="flex flex-wrap gap-1">
                    {order.items.map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="text-xs px-2 py-1 rounded bg-white/10 text-white/90"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timing and Chef Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Order: {order.orderTime}
                    </span>
                    {order.cookTime && (
                      <span className="text-muted-foreground">
                        Cook: {order.cookTime}
                      </span>
                    )}
                  </div>
                  {order.chef && (
                    <span className="text-cyan-400">
                      Chef: {order.chef}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {order.elapsed}m / {order.estimatedTime}m
                    </span>
                    <span className={`font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        isDelayed 
                          ? 'bg-red-400' 
                          : order.elapsed / order.estimatedTime >= 0.8
                            ? 'bg-orange-400'
                            : 'bg-green-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, (order.elapsed / order.estimatedTime) * 100)}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-300">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      {order.notes}
                    </p>
                  </div>
                )}

                {/* Temperature for steaks */}
                {order.temperature && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">
                      Temperature: <span className="text-orange-400">{order.temperature}</span>
                    </span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No active kitchen orders</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}