'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SalesChart } from '@/components/charts/sales-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SALES_DATA, MENU_ITEMS } from '@/constants/demo-data'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  Download,
  Filter
} from 'lucide-react'

export default function AnalyticsPage() {
  // Generate hourly sales data for demo
  const hourlyData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 12}:00`,
    sales: Math.floor(Math.random() * 800) + 200,
    orders: Math.floor(Math.random() * 15) + 5
  }))

  // Category performance data
  const categoryData = [
    { name: 'Entrees', value: 45, sales: 12500 },
    { name: 'Appetizers', value: 25, sales: 6800 },
    { name: 'Beverages', value: 20, sales: 4200 },
    { name: 'Desserts', value: 10, sales: 2100 }
  ]

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

  // Calculate key metrics
  const totalRevenue = SALES_DATA.reduce((sum, day) => sum + day.sales, 0)
  const totalOrders = SALES_DATA.reduce((sum, day) => sum + day.orders, 0)
  const avgOrderValue = totalRevenue / totalOrders
  const bestDay = SALES_DATA.reduce((max, day) => day.sales > max.sales ? day : max, SALES_DATA[0])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Business intelligence and performance insights
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">Weekly Revenue</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% vs last week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-xs text-blue-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8.2% vs last week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Target className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-xs text-purple-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +4.1% vs last week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bestDay.name}</p>
                  <p className="text-sm text-muted-foreground">Best Day</p>
                  <p className="text-xs text-yellow-400">
                    {formatCurrency(bestDay.sales)} revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Sales Trend */}
          <SalesChart 
            data={SALES_DATA}
            title="Weekly Sales Trend"
            description="Daily revenue performance over the past week"
          />

          {/* Hourly Performance */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Today's Hourly Performance</CardTitle>
              <p className="text-sm text-muted-foreground">Sales distribution throughout the day</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="hour" stroke="#a1a1aa" fontSize={12} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(26, 26, 46, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`$${value}`, 'Sales']}
                  />
                  <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Breakdown */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <p className="text-sm text-muted-foreground">Revenue distribution across menu categories</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(26, 26, 46, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name, props) => [
                      `${value}% (${formatCurrency(props.payload.sales)})`, 
                      props.payload.name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Items */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Top Performing Items</CardTitle>
              <p className="text-sm text-muted-foreground">Best sellers by revenue</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MENU_ITEMS.sort((a, b) => b.profit - a.profit).slice(0, 4).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(item.profit)}</p>
                      <p className="text-sm text-green-400">{item.popularity}% popularity</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <p className="text-sm text-muted-foreground">Performance indicators</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Food Cost %</span>
                  <span className="font-bold text-green-400">28.5%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Labor Cost %</span>
                  <span className="font-bold text-yellow-400">31.2%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Table Turnover</span>
                  <span className="font-bold text-blue-400">2.3x</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-bold text-purple-400">4.6/5</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Gross Profit Margin</span>
                  <span className="font-bold text-green-400">68.7%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
            <p className="text-sm text-muted-foreground">
              Automated analysis and actionable recommendations
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-400 mb-1">Revenue Growth Opportunity</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Weekend dinner service shows 23% higher AOV. Consider extending weekend specials.
                    </p>
                    <p className="text-xs text-green-400">Potential impact: +$2,400/month</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-400 mb-1">Peak Hour Optimization</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      7-8 PM shows highest demand but longest wait times. Consider staff adjustments.
                    </p>
                    <p className="text-xs text-blue-400">Recommended: +1 server during peak</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-400 mb-1">Menu Engineering Alert</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Truffle Pasta has high profit margin but low visibility. Improve menu placement.
                    </p>
                    <p className="text-xs text-yellow-400">Expected lift: 15-20% in orders</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-400 mb-1">Cost Optimization</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Food costs are 2% below target. Consider premium ingredient upgrades.
                    </p>
                    <p className="text-xs text-purple-400">Opportunity: Enhance customer experience</p>
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