'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { INVENTORY_ITEMS } from '@/constants/demo-data'
import { formatCurrency } from '@/lib/utils'
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  FileText,
  Search,
  Filter,
  Plus
} from 'lucide-react'

export default function InventoryPage() {
  const [selectedView, setSelectedView] = useState('overview') // 'overview', 'items', 'orders'
  const [searchTerm, setSearchTerm] = useState('')

  const getStockStatus = (stock, par) => {
    const percentage = (stock / par) * 100
    if (percentage <= 25) return { status: 'critical', color: 'text-red-400 bg-red-500/20' }
    if (percentage <= 50) return { status: 'low', color: 'text-yellow-400 bg-yellow-500/20' }
    if (percentage <= 75) return { status: 'medium', color: 'text-blue-400 bg-blue-500/20' }
    return { status: 'good', color: 'text-green-400 bg-green-500/20' }
  }

  const criticalItems = INVENTORY_ITEMS.filter(item => {
    const percentage = (item.stock / item.par) * 100
    return percentage <= 25
  })

  const lowStockItems = INVENTORY_ITEMS.filter(item => {
    const percentage = (item.stock / item.par) * 100
    return percentage > 25 && percentage <= 50
  })

  const totalValue = INVENTORY_ITEMS.reduce((sum, item) => sum + (item.stock * item.cost), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">
              Real-time inventory tracking and supply chain management
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={selectedView === 'overview' ? 'default' : 'outline'}
              onClick={() => setSelectedView('overview')}
            >
              <Package className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={selectedView === 'items' ? 'default' : 'outline'}
              onClick={() => setSelectedView('items')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Items
            </Button>
            <Button
              variant={selectedView === 'orders' ? 'default' : 'outline'}
              onClick={() => setSelectedView('orders')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Orders
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Package className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{INVENTORY_ITEMS.length}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <TrendingDown className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
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
                  <p className="text-2xl font-bold">{criticalItems.length}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedView === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Critical Alerts */}
            <Card className="glass-card border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {criticalItems.length > 0 ? (
                  <div className="space-y-3">
                    {criticalItems.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-red-400">
                              {item.stock} {item.unit} remaining
                            </p>
                          </div>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            Order Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No critical alerts at this time
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Warnings */}
            <Card className="glass-card border-yellow-500/50">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Low Stock Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockItems.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-yellow-400">
                              {item.stock} / {item.par} {item.unit}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    All items have adequate stock levels
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-sm font-medium">Delivery received</p>
                      <p className="text-xs text-muted-foreground">Prime Beef - 50 lbs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Package className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium">Order placed</p>
                      <p className="text-xs text-muted-foreground">Organic Vegetables - Various</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium">Low stock alert</p>
                      <p className="text-xs text-muted-foreground">Truffle Oil - 8 bottles left</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedView === 'items' ? (
          /* Items List View */
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search inventory items..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Items Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {INVENTORY_ITEMS.filter(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((item, index) => {
                    const stockInfo = getStockStatus(item.stock, item.par)
                    const percentage = Math.round((item.stock / item.par) * 100)
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.cost)} per {item.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{item.stock}</p>
                            <p className="text-sm text-muted-foreground">{item.unit}</p>
                          </div>

                          <div className="w-32">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Stock Level</span>
                              <span className={stockInfo.color.split(' ')[0]}>{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  percentage <= 25 ? 'bg-red-500' :
                                  percentage <= 50 ? 'bg-yellow-500' :
                                  percentage <= 75 ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>

                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                            {stockInfo.status}
                          </span>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm">
                              Order
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Purchase Orders View */
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Purchase Orders</CardTitle>
                <Button className="bg-primary hover:bg-primary/90">
                  Create Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">PO-2024-001</h3>
                      <p className="text-sm text-muted-foreground">Premium Food Suppliers</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                      Pending
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">Jan 20, 2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected</p>
                      <p className="font-medium">Jan 22, 2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">{formatCurrency(1250.00)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">PO-2024-002</h3>
                      <p className="text-sm text-muted-foreground">Organic Produce Co.</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      Received
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">Jan 18, 2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Received</p>
                      <p className="font-medium">Jan 19, 2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">{formatCurrency(780.50)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}