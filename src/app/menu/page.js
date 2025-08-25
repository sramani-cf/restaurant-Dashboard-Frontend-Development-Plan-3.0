'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddMenuItemModal } from '@/components/ui/add-menu-item-modal'
import { MENU_ITEMS } from '@/constants/demo-data'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  Plus,
  Edit,
  TrendingUp,
  TrendingDown,
  Star,
  AlertCircle,
  BarChart3,
  Eye
} from 'lucide-react'

export default function MenuPage() {
  const [selectedView, setSelectedView] = useState('matrix') // 'matrix', 'list', 'categories'
  const [menuItems, setMenuItems] = useState(MENU_ITEMS)

  const handleAddMenuItem = (newItem) => {
    setMenuItems(prev => [...prev, newItem])
  }

  // Calculate menu engineering categories
  const getMenuCategory = (item) => {
    const profitMargin = ((item.price - item.cost) / item.price) * 100
    
    if (item.popularity >= 80 && profitMargin >= 60) return 'star'
    if (item.popularity >= 80 && profitMargin < 60) return 'plow'
    if (item.popularity < 80 && profitMargin >= 60) return 'puzzle'
    return 'dog'
  }

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'star':
        return {
          label: 'Stars',
          description: 'High profit, High popularity',
          color: 'text-green-400 bg-green-500/20 border-green-500/30',
          icon: Star,
          action: 'Promote heavily'
        }
      case 'plow':
        return {
          label: 'Plowhorses',
          description: 'Low profit, High popularity',
          color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
          icon: TrendingDown,
          action: 'Increase price or reduce cost'
        }
      case 'puzzle':
        return {
          label: 'Puzzles',
          description: 'High profit, Low popularity',
          color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
          icon: AlertCircle,
          action: 'Better placement/promotion'
        }
      case 'dog':
        return {
          label: 'Dogs',
          description: 'Low profit, Low popularity',
          color: 'text-red-400 bg-red-500/20 border-red-500/30',
          icon: TrendingDown,
          action: 'Consider removing'
        }
    }
  }

  const categoryStats = {
    star: menuItems.filter(item => getMenuCategory(item) === 'star').length,
    plow: menuItems.filter(item => getMenuCategory(item) === 'plow').length,
    puzzle: menuItems.filter(item => getMenuCategory(item) === 'puzzle').length,
    dog: menuItems.filter(item => getMenuCategory(item) === 'dog').length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">
              Menu engineering and recipe management
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={selectedView === 'matrix' ? 'default' : 'outline'}
              onClick={() => setSelectedView('matrix')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Matrix View
            </Button>
            <Button
              variant={selectedView === 'list' ? 'default' : 'outline'}
              onClick={() => setSelectedView('list')}
            >
              <Eye className="h-4 w-4 mr-2" />
              List View
            </Button>
            <AddMenuItemModal onAddItem={handleAddMenuItem}>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </AddMenuItemModal>
          </div>
        </div>

        {/* Menu Engineering Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categoryStats).map(([key, count]) => {
            const info = getCategoryInfo(key)
            const Icon = info.icon
            
            return (
              <Card key={key} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${info.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm font-medium">{info.label}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {selectedView === 'matrix' ? (
          /* Menu Engineering Matrix */
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Menu Engineering Matrix</CardTitle>
              <p className="text-sm text-muted-foreground">
                Items plotted by popularity (x-axis) vs profitability (y-axis)
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative bg-slate-900/30 rounded-lg p-8 min-h-[500px] border border-white/10">
                {/* Axis Labels */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
                  Popularity →
                </div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm text-muted-foreground">
                  ← Profitability
                </div>

                {/* Quadrant Labels */}
                <div className="absolute top-4 left-4 text-xs text-red-400 font-medium">Dogs</div>
                <div className="absolute top-4 right-4 text-xs text-green-400 font-medium">Stars</div>
                <div className="absolute bottom-8 left-4 text-xs text-yellow-400 font-medium">Puzzles</div>
                <div className="absolute bottom-8 right-4 text-xs text-blue-400 font-medium">Plowhorses</div>

                {/* Grid Lines */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10"></div>

                {/* Menu Items */}
                {menuItems.map((item) => {
                  const category = getMenuCategory(item)
                  const info = getCategoryInfo(category)
                  const profitMargin = ((item.price - item.cost) / item.price) * 100
                  
                  const x = (item.popularity / 100) * 80 + 10  // 10-90% of width
                  const y = 90 - (profitMargin / 100) * 80     // 10-90% of height (inverted)

                  return (
                    <div
                      key={item.id}
                      className={`absolute w-16 h-16 rounded-lg border-2 cursor-pointer transition-all hover:scale-110 flex flex-col items-center justify-center text-xs font-medium ${info.color}`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={`${item.name}\nPopularity: ${item.popularity}%\nProfit Margin: ${profitMargin.toFixed(1)}%`}
                    >
                      <div className="text-center">
                        <div className="text-xs truncate w-14">{item.name.split(' ')[0]}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(item.price)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* List View */
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuItems.map((item) => {
                  const category = getMenuCategory(item)
                  const info = getCategoryInfo(category)
                  const profitMargin = ((item.price - item.cost) / item.price) * 100
                  const Icon = info.icon

                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-muted-foreground">{item.category}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm">
                              Popularity: <span className="font-medium">{item.popularity}%</span>
                            </span>
                            <span className="text-sm">
                              Profit Margin: <span className="font-medium">{profitMargin.toFixed(1)}%</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency(item.price)}</p>
                          <p className="text-sm text-muted-foreground">
                            Cost: {formatCurrency(item.cost)}
                          </p>
                        </div>

                        <div className={`p-2 rounded-lg ${info.color} flex items-center gap-2`}>
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{info.label}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <p className="text-sm text-muted-foreground">
              Data-driven suggestions to optimize your menu
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-400">Promote Stars</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Caesar Salad and Truffle Pasta are performing exceptionally well
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommendation: Feature prominently on menu and train servers to recommend
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-400">Optimize Plowhorses</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Consider a small price increase for Wagyu Steak
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommendation: Test $5 price increase or reduce portion cost
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-400">Boost Puzzles</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Lobster Thermidor has high profit but low popularity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recommendation: Better menu placement or special promotion
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-red-400">Review Dogs</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      No current items in this category
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Great work! Keep monitoring new items to prevent dogs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}