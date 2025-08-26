'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  LIVE_KITCHEN_ORDERS,
  LIVE_SERVICE_UPDATES, 
  LIVE_FINANCIAL_STREAM,
  LIVE_ALERTS,
  LIVE_METRICS
} from '@/constants/demo-data'

export function useLiveFeed() {
  const [kitchenOrders, setKitchenOrders] = useState(LIVE_KITCHEN_ORDERS)
  const [serviceUpdates, setServiceUpdates] = useState(LIVE_SERVICE_UPDATES)
  const [financialStream, setFinancialStream] = useState(LIVE_FINANCIAL_STREAM)
  const [alerts, setAlerts] = useState(LIVE_ALERTS)
  const [metrics, setMetrics] = useState(LIVE_METRICS)
  const [isActive, setIsActive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time updates
  const updateKitchenOrders = useCallback(() => {
    setKitchenOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.status === 'cooking' || order.status === 'pending') {
          const newElapsed = order.elapsed + Math.floor(Math.random() * 2)
          let newStatus = order.status
          
          if (newElapsed >= order.estimatedTime * 0.9 && order.status === 'cooking') {
            newStatus = 'plating'
          } else if (newElapsed >= order.estimatedTime && order.status === 'plating') {
            newStatus = 'ready'
          } else if (order.status === 'pending' && Math.random() > 0.7) {
            newStatus = 'cooking'
            return {
              ...order,
              status: newStatus,
              cookTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              chef: order.chef || 'Sarah Johnson'
            }
          }
          
          return {
            ...order,
            elapsed: newElapsed,
            status: newStatus
          }
        }
        return order
      })
    })
  }, [])

  const updateServiceUpdates = useCallback(() => {
    const serviceActions = [
      { type: 'order_delivered', details: 'Food delivered to table' },
      { type: 'table_cleared', details: 'Table cleared and cleaned' },
      { type: 'customer_arrived', details: 'Walk-in party of 3 seated' },
      { type: 'drink_refilled', details: 'Beverages refilled' },
      { type: 'check_requested', details: 'Table requested check' }
    ]
    
    if (Math.random() > 0.6) {
      const newUpdate = {
        id: Date.now(),
        ...serviceActions[Math.floor(Math.random() * serviceActions.length)],
        table: Math.floor(Math.random() * 25 + 1).toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        server: ['Emma Davis', 'Tom Wilson', 'Sarah Johnson'][Math.floor(Math.random() * 3)],
        guests: Math.floor(Math.random() * 6 + 1)
      }
      
      setServiceUpdates(prev => [newUpdate, ...prev.slice(0, 19)])
    }
  }, [])

  const updateFinancialStream = useCallback(() => {
    if (Math.random() > 0.7) {
      const saleAmount = Math.floor(Math.random() * 200 + 50)
      const newSale = {
        id: Date.now(),
        type: 'sale',
        amount: saleAmount,
        table: Math.floor(Math.random() * 25 + 1).toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: ['Credit Card', 'Cash', 'Mobile Pay'][Math.floor(Math.random() * 3)],
        server: ['Emma Davis', 'Tom Wilson', 'Sarah Johnson'][Math.floor(Math.random() * 3)]
      }
      
      setFinancialStream(prev => [newSale, ...prev.slice(0, 19)])
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        currentRevenue: prev.currentRevenue + saleAmount,
        ordersToday: prev.ordersToday + 1
      }))
    }
  }, [])

  const updateAlerts = useCallback(() => {
    const alertTypes = [
      {
        type: 'warning',
        title: 'Table Wait Time',
        message: `Table ${Math.floor(Math.random() * 25 + 1)} waiting longer than expected`,
        category: 'service'
      },
      {
        type: 'info',
        title: 'Kitchen Update',
        message: 'All orders on track for timely delivery',
        category: 'kitchen'
      },
      {
        type: 'warning',
        title: 'Inventory Alert',
        message: 'Fresh salmon running low',
        category: 'inventory'
      }
    ]
    
    if (Math.random() > 0.8) {
      const newAlert = {
        id: Date.now(),
        ...alertTypes[Math.floor(Math.random() * alertTypes.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        acknowledged: false
      }
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)])
    }
  }, [])

  const updateMetrics = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      avgWaitTime: Math.max(15, prev.avgWaitTime + Math.floor(Math.random() * 3 - 1)),
      tableOccupancy: Math.min(100, Math.max(50, prev.tableOccupancy + Math.floor(Math.random() * 6 - 3))),
      kitchenEfficiency: Math.min(100, Math.max(80, prev.kitchenEfficiency + Math.floor(Math.random() * 4 - 2))),
      customerSatisfaction: Math.min(5.0, Math.max(4.0, prev.customerSatisfaction + (Math.random() * 0.2 - 0.1))),
      staffPerformance: Math.min(100, Math.max(75, prev.staffPerformance + Math.floor(Math.random() * 4 - 2)))
    }))
  }, [])

  // Start/stop live updates
  const startLiveFeed = useCallback(() => {
    setIsActive(true)
    setLastUpdate(new Date())
  }, [])

  const stopLiveFeed = useCallback(() => {
    setIsActive(false)
  }, [])

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }, [])

  const clearAcknowledgedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(alert => !alert.acknowledged))
  }, [])

  // Effect for live updates
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      updateKitchenOrders()
      updateServiceUpdates()
      updateFinancialStream()
      updateAlerts()
      updateMetrics()
      setLastUpdate(new Date())
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [isActive, updateKitchenOrders, updateServiceUpdates, updateFinancialStream, updateAlerts, updateMetrics])

  return {
    // Data
    kitchenOrders,
    serviceUpdates,
    financialStream,
    alerts,
    metrics,
    
    // Status
    isActive,
    lastUpdate,
    
    // Actions
    startLiveFeed,
    stopLiveFeed,
    acknowledgeAlert,
    clearAcknowledgedAlerts,
    
    // Computed values
    unacknowledgedAlerts: alerts.filter(alert => !alert.acknowledged).length,
    criticalAlerts: alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged).length,
    activeOrders: kitchenOrders.filter(order => ['cooking', 'plating'].includes(order.status)).length,
    pendingOrders: kitchenOrders.filter(order => order.status === 'pending').length
  }
}