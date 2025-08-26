'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock, 
  Check,
  Settings,
  Users,
  Package,
  ChefHat,
  X
} from 'lucide-react'

export function AlertsFeed({ alerts, onAcknowledgeAlert, onClearAcknowledged, className = "" }) {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return AlertTriangle
      case 'warning': return AlertCircle
      case 'info': return Info
      default: return Info
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getBadgeColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'equipment': return Settings
      case 'service': return Users
      case 'inventory': return Package
      case 'kitchen': return ChefHat
      case 'staff': return Users
      default: return AlertCircle
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'equipment': return 'text-orange-400'
      case 'service': return 'text-blue-400'
      case 'inventory': return 'text-green-400'
      case 'kitchen': return 'text-yellow-400'
      case 'staff': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged)

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Alerts & Issues
            {unacknowledgedAlerts.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </CardTitle>
          {acknowledgedAlerts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAcknowledged}
              className="text-xs glass border-red-500/30 hover:bg-red-500/10"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Unacknowledged Alerts */}
          {unacknowledgedAlerts.map((alert, index) => {
            const AlertIcon = getAlertIcon(alert.type)
            const CategoryIcon = getCategoryIcon(alert.category)
            const alertColor = getAlertColor(alert.type)
            const categoryColor = getCategoryColor(alert.category)
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border bg-white/5 ${
                  alert.type === 'critical' 
                    ? 'border-red-500/40 bg-red-500/10 shadow-red-500/20 shadow-lg' 
                    : alert.type === 'warning'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-blue-500/30 bg-blue-500/5'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertIcon className={`h-4 w-4 ${alertColor}`} />
                    <Badge className={getBadgeColor(alert.type)}>
                      {alert.type.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <CategoryIcon className={`h-3 w-3 ${categoryColor}`} />
                      <span className={`text-xs ${categoryColor} capitalize`}>
                        {alert.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {alert.timestamp}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="text-xs glass border-green-500/30 hover:bg-green-500/10"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Ack
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-2">
                  <h4 className="font-medium text-sm text-white/90 mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {/* Acknowledged Alerts */}
          {acknowledgedAlerts.map((alert, index) => {
            const AlertIcon = getAlertIcon(alert.type)
            const CategoryIcon = getCategoryIcon(alert.category)
            const alertColor = getAlertColor(alert.type)
            const categoryColor = getCategoryColor(alert.category)
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="p-3 rounded-lg border border-white/10 bg-white/5 opacity-60"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertIcon className={`h-4 w-4 ${alertColor}`} />
                    <Badge className={getBadgeColor(alert.type)}>
                      {alert.type.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <CategoryIcon className={`h-3 w-3 ${categoryColor}`} />
                      <span className={`text-xs ${categoryColor} capitalize`}>
                        {alert.category}
                      </span>
                    </div>
                    <Check className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {alert.timestamp}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-medium text-sm text-white/70 mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Check className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-400" />
            <p>All systems operating normally</p>
            <p className="text-xs mt-1">No active alerts</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}