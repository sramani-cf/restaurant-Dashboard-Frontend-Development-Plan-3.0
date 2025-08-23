'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MENU_ITEMS } from '@/constants/demo-data'
import { formatCurrency } from '@/lib/utils'
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  Trash2,
  User,
  Clock,
  Search,
  X
} from 'lucide-react'

export default function POSPage() {
  const [currentOrder, setCurrentOrder] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentTable, setCurrentTable] = useState(12)
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['All', 'Entrees', 'Appetizers', 'Beverages', 'Desserts']

  const filteredItems = MENU_ITEMS
    .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const addToOrder = (item) => {
    const existingItem = currentOrder.find(orderItem => orderItem.id === item.id)
    if (existingItem) {
      setCurrentOrder(currentOrder.map(orderItem =>
        orderItem.id === item.id
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ))
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (id, change) => {
    setCurrentOrder(currentOrder.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
      }
      return item
    }).filter(Boolean))
  }

  const removeItem = (id) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== id))
  }

  const getOrderTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const clearOrder = () => {
    setCurrentOrder([])
  }

  const processOrder = () => {
    // Simulate order processing
    alert('Order sent to kitchen!')
    clearOrder()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Point of Sale</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Table {currentTable} • Server Station
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleTimeString()}
            </div>
            <Button variant="outline" onClick={clearOrder}>
              Clear Order
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-cyan-500/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-300/50 transition-all duration-300 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results Count */}
            {(searchQuery || selectedCategory !== 'All') && (
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                </span>
                {(searchQuery || selectedCategory !== 'All') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('All')
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {/* Menu Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="glass-card cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => addToOrder(item)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                      <p className="text-muted-foreground text-xs mb-2">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(item.price)}
                        </span>
                        <Button size="sm" variant="secondary">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Search className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No items found</h3>
                  <p className="text-slate-400 mb-4">
                    {searchQuery 
                      ? `No menu items match "${searchQuery}"` 
                      : `No items found in ${selectedCategory} category`
                    }
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('All')
                    }}
                    className="text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Current Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentOrder.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No items in order</p>
                    <p className="text-sm">Select items to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentOrder.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Total and Actions */}
            {currentOrder.length > 0 && (
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">
                        {formatCurrency(getOrderTotal())}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="w-full">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cash
                      </Button>
                      <Button variant="outline" className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Card
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90" 
                      size="lg"
                      onClick={processOrder}
                    >
                      Send to Kitchen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    Hold Order
                  </Button>
                  <Button variant="outline" size="sm">
                    Split Bill
                  </Button>
                  <Button variant="outline" size="sm">
                    Add Discount
                  </Button>
                  <Button variant="outline" size="sm">
                    Customer Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}