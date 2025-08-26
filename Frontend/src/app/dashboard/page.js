'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { SalesChart } from '@/components/charts/sales-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LiveFeedModal } from '@/components/live-feed/live-feed-modal'
import { SALES_DATA, RESERVATION_DATA, KDS_ORDERS } from '@/constants/demo-data'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function DashboardPage() {
  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(false)
  
  // Calculate total sales for the week
  const totalSales = SALES_DATA.reduce((sum, day) => sum + day.sales, 0)
  const totalOrders = SALES_DATA.reduce((sum, day) => sum + day.orders, 0)
  const avgOrderValue = totalSales / totalOrders

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">Command Center</h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Welcome back! Here's what's happening at your restaurant today.
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto whitespace-nowrap"
            onClick={() => setIsLiveFeedOpen(true)}
          >
            <span className="hidden sm:inline">View Live Feed</span>
            <span className="sm:hidden">Live Feed</span>
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-1 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalSales)}
            change="+12.3%"
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Total Orders"
            value={totalOrders.toLocaleString()}
            change="+8.2%"
            icon={ShoppingCart}
            trend="up"
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(avgOrderValue)}
            change="+4.1%"
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Active Tables"
            value="18/25"
            change="+15.4%"
            icon={Users}
            trend="up"
          />
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Sales Chart */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <SalesChart 
              data={SALES_DATA}
              title="Weekly Sales Performance"
              description="Revenue trends for the past 7 days"
            />
          </div>

          {/* Recent Activity */}
          <Card className="glass-card order-1 lg:order-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Real-Time Activity</CardTitle>
              <CardDescription className="text-sm">Live updates from your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">Order #123 completed</p>
                  <p className="text-xs text-muted-foreground">Table 12 - 2 min ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">New reservation</p>
                  <p className="text-xs text-muted-foreground">Party of 4 - 7:30 PM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">Kitchen alert</p>
                  <p className="text-xs text-muted-foreground">Order taking longer than usual</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">Low inventory alert</p>
                  <p className="text-xs text-muted-foreground">Wagyu beef running low</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {/* Today's Reservations */}
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Today's Reservations</CardTitle>
              <CardDescription className="text-sm">Upcoming bookings and table status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {RESERVATION_DATA.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-white/10 bg-white/5 min-h-[50px] sm:min-h-[60px]">
                    <div className="flex-1 min-w-0 pr-2 sm:pr-3">
                      <p className="font-medium truncate text-sm sm:text-base">{reservation.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {reservation.guests} guests • Table {reservation.table}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-xs sm:text-sm">{reservation.time}</p>
                      <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                        reservation.status === 'confirmed' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kitchen Orders */}
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Kitchen Queue</CardTitle>
              <CardDescription className="text-sm">Current orders in preparation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {KDS_ORDERS.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-white/10 bg-white/5 min-h-[50px] sm:min-h-[60px]">
                    <div className="flex-1 min-w-0 pr-2 sm:pr-3">
                      <p className="font-medium truncate text-sm sm:text-base">Order {order.id}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        Table {order.table} • {order.items.length} items
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-xs sm:text-sm">{order.time}</p>
                      <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                        order.status === 'new' 
                          ? 'bg-blue-500/20 text-blue-400'
                          : order.status === 'preparing'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Feed Modal */}
      <LiveFeedModal 
        isOpen={isLiveFeedOpen}
        onClose={() => setIsLiveFeedOpen(false)}
      />
    </DashboardLayout>
  )
}