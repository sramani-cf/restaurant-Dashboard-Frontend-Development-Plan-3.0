'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { SalesChart } from '@/components/charts/sales-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  // Calculate total sales for the week
  const totalSales = SALES_DATA.reduce((sum, day) => sum + day.sales, 0)
  const totalOrders = SALES_DATA.reduce((sum, day) => sum + day.orders, 0)
  const avgOrderValue = totalSales / totalOrders

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Command Center</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening at your restaurant today.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            View Live Feed
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Chart */}
          <div className="lg:col-span-2">
            <SalesChart 
              data={SALES_DATA}
              title="Weekly Sales Performance"
              description="Revenue trends for the past 7 days"
            />
          </div>

          {/* Recent Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Real-Time Activity</CardTitle>
              <CardDescription>Live updates from your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Order #123 completed</p>
                  <p className="text-xs text-muted-foreground">Table 12 - 2 min ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Users className="h-4 w-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New reservation</p>
                  <p className="text-xs text-muted-foreground">Party of 4 - 7:30 PM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Clock className="h-4 w-4 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Kitchen alert</p>
                  <p className="text-xs text-muted-foreground">Order taking longer than usual</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Low inventory alert</p>
                  <p className="text-xs text-muted-foreground">Wagyu beef running low</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Today's Reservations */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Today's Reservations</CardTitle>
              <CardDescription>Upcoming bookings and table status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RESERVATION_DATA.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex-1">
                      <p className="font-medium">{reservation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.guests} guests • Table {reservation.table}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{reservation.time}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
            <CardHeader>
              <CardTitle>Kitchen Queue</CardTitle>
              <CardDescription>Current orders in preparation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {KDS_ORDERS.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex-1">
                      <p className="font-medium">Order {order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Table {order.table} • {order.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.time}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
    </DashboardLayout>
  )
}