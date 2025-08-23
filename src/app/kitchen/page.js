'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KDS_ORDERS } from '@/constants/demo-data'
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Utensils,
  Flame,
  Users,
  Timer
} from 'lucide-react'

export default function KitchenPage() {
  const [orders, setOrders] = useState(KDS_ORDERS)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedStation, setSelectedStation] = useState('all')

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const stations = ['all', 'cold', 'hot', 'grill', 'dessert']

  const getOrderElapsedTime = (orderTime) => {
    const [hours, minutes] = orderTime.split(':').map(Number)
    const orderDate = new Date()
    orderDate.setHours(hours, minutes, 0, 0)
    
    const elapsed = Math.floor((currentTime - orderDate) / 60000) // minutes
    return elapsed > 0 ? elapsed : Math.floor(Math.random() * 15) + 5 // demo fallback
  }

  const getTimeColor = (elapsed, status) => {
    if (status === 'ready') return 'text-green-400'
    if (elapsed > 20) return 'text-red-400'
    if (elapsed > 15) return 'text-yellow-400'
    return 'text-blue-400'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      default: return 'border-blue-500 bg-blue-500/10'
    }
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const filteredOrders = selectedStation === 'all' 
    ? orders 
    : orders.filter(order => {
        // Simple station filtering logic for demo
        const items = order.items.join(' ').toLowerCase()
        if (selectedStation === 'cold' && items.includes('salad')) return true
        if (selectedStation === 'hot' && items.includes('pasta')) return true
        if (selectedStation === 'grill' && items.includes('steak')) return true
        return selectedStation === 'all'
      })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kitchen Display System</h1>
            <p className="text-muted-foreground">
              Real-time order management for kitchen operations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-2xl font-mono font-bold">
              <Clock className="h-6 w-6 text-primary" />
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Kitchen Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Utensils className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Timer className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Avg Time (min)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Over Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Filters */}
        <div className="flex gap-2 flex-wrap">
          {stations.map((station) => (
            <Button
              key={station}
              variant={selectedStation === station ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStation(station)}
              className="capitalize"
            >
              <Flame className="h-4 w-4 mr-2" />
              {station === 'all' ? 'All Stations' : `${station} Station`}
            </Button>
          ))}
        </div>

        {/* Order Tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const elapsed = getOrderElapsedTime(order.time)
            const timeColor = getTimeColor(elapsed, order.status)
            
            return (
              <Card key={order.id} className={`glass-card border-2 ${getPriorityColor(order.priority)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{order.id}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-mono font-bold ${timeColor}`}>
                        {elapsed}m
                      </span>
                      {order.priority === 'high' && (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Table {order.table}
                    </span>
                    <span>{order.time}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-white/5">
                          <span className="font-medium">{item}</span>
                          <div className="w-4 h-4 rounded-full border-2 border-white/30"></div>
                        </div>
                      ))}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {order.status === 'new' ? 'New Order' :
                         order.status === 'preparing' ? 'In Progress' : 'Ready'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      {order.status === 'new' && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                        >
                          Start Prep
                        </Button>
                      )}
                      
                      {order.status === 'preparing' && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                        >
                          Mark Ready
                        </Button>
                      )}
                      
                      {order.status === 'ready' && (
                        <div className="flex gap-2 flex-1">
                          <Button size="sm" variant="outline" className="flex-1">
                            Hold
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary"
                            onClick={() => {
                              // Remove from display when served
                              setOrders(orders.filter(o => o.id !== order.id))
                            }}
                          >
                            Served
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Emergency Actions */}
        <Card className="glass-card border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="destructive" size="sm">
                Fire All Orders
              </Button>
              <Button variant="destructive" size="sm">
                Call Manager
              </Button>
              <Button variant="outline" size="sm">
                System Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}