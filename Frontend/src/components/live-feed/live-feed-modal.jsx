'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  Maximize2,
  Activity,
  ChefHat,
  Users,
  DollarSign,
  AlertTriangle,
  Camera,
  Clock
} from 'lucide-react'

import { LiveMetrics } from './live-metrics'
import { KitchenFeed } from './kitchen-feed'
import { ServiceFeed } from './service-feed'
import { FinancialFeed } from './financial-feed'
import { AlertsFeed } from './alerts-feed'
import { ActivityTimeline } from './activity-timeline'
import { CameraViews } from './camera-views'
import { useLiveFeed } from '@/hooks/use-live-feed'

export function LiveFeedModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const {
    kitchenOrders,
    serviceUpdates,
    financialStream,
    alerts,
    metrics,
    isActive,
    lastUpdate,
    startLiveFeed,
    stopLiveFeed,
    acknowledgeAlert,
    clearAcknowledgedAlerts,
    unacknowledgedAlerts,
    criticalAlerts,
    activeOrders,
    pendingOrders
  } = useLiveFeed()

  // Start live feed when modal opens
  useEffect(() => {
    if (isOpen) {
      startLiveFeed()
    } else {
      stopLiveFeed()
    }
    
    return () => stopLiveFeed()
  }, [isOpen, startLiveFeed, stopLiveFeed])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Activity,
      badge: null
    },
    { 
      id: 'kitchen', 
      label: 'Kitchen', 
      icon: ChefHat,
      badge: activeOrders > 0 ? activeOrders : null
    },
    { 
      id: 'service', 
      label: 'Service', 
      icon: Users,
      badge: null
    },
    { 
      id: 'financial', 
      label: 'Financial', 
      icon: DollarSign,
      badge: null
    },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: AlertTriangle,
      badge: unacknowledgedAlerts > 0 ? unacknowledgedAlerts : null
    },
    { 
      id: 'cameras', 
      label: 'Cameras', 
      icon: Camera,
      badge: null
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <LiveMetrics metrics={metrics} />
            <div className="grid gap-6 lg:grid-cols-2">
              <ActivityTimeline 
                serviceUpdates={serviceUpdates.slice(0, 10)}
                financialStream={financialStream.slice(0, 5)}
                alerts={alerts.slice(0, 3)}
              />
              <div className="space-y-4">
                <KitchenFeed orders={kitchenOrders.slice(0, 3)} />
              </div>
            </div>
          </div>
        )
      case 'kitchen':
        return <KitchenFeed orders={kitchenOrders} />
      case 'service':
        return <ServiceFeed updates={serviceUpdates} />
      case 'financial':
        return <FinancialFeed stream={financialStream} />
      case 'alerts':
        return (
          <AlertsFeed 
            alerts={alerts}
            onAcknowledgeAlert={acknowledgeAlert}
            onClearAcknowledged={clearAcknowledgedAlerts}
          />
        )
      case 'cameras':
        return <CameraViews />
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 md:inset-8 z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass-card flex-1 flex flex-col border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
              {/* Header */}
              <CardHeader className="pb-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Activity className="h-6 w-6 text-cyan-400" />
                      Live Restaurant Feed
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                      {/* Status Indicator */}
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ 
                            backgroundColor: isActive ? '#22c55e' : '#ef4444',
                            scale: isActive ? [1, 1.2, 1] : 1
                          }}
                          transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                          className="w-2 h-2 rounded-full"
                        />
                        <span className={`text-sm font-medium ${
                          isActive ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isActive ? 'LIVE' : 'OFFLINE'}
                        </span>
                      </div>

                      {/* Last Update */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {lastUpdate.toLocaleTimeString()}
                      </div>

                      {/* Critical Alerts Badge */}
                      {criticalAlerts > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                          {criticalAlerts} Critical
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Controls */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isActive ? stopLiveFeed : startLiveFeed}
                      className="glass border-white/20 hover:bg-white/10"
                    >
                      {isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-white/20 hover:bg-white/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-white/20 hover:bg-white/10"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClose}
                      className="glass border-red-500/30 hover:bg-red-500/10 text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex items-center gap-2 mt-4 overflow-x-auto">
                  {tabs.map(tab => {
                    const TabIcon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                      <Button
                        key={tab.id}
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab(tab.id)}
                        className={`glass border-white/20 hover:bg-white/10 min-w-fit whitespace-nowrap ${
                          isActive 
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        <TabIcon className="h-4 w-4 mr-2" />
                        {tab.label}
                        {tab.badge && (
                          <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            {tab.badge}
                          </Badge>
                        )}
                      </Button>
                    )
                  })}
                </div>
              </CardHeader>
              
              {/* Content */}
              <CardContent className="flex-1 overflow-auto p-6">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {renderTabContent()}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}