'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  Users, 
  ChefHat, 
  Star, 
  TrendingUp 
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function LiveMetrics({ metrics, className = "" }) {
  const metricsData = [
    {
      title: "Current Revenue",
      value: formatCurrency(metrics.currentRevenue),
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Orders Today", 
      value: metrics.ordersToday.toString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10", 
      borderColor: "border-blue-500/20"
    },
    {
      title: "Avg Wait Time",
      value: `${metrics.avgWaitTime}m`,
      icon: Clock,
      color: metrics.avgWaitTime > 30 ? "text-red-400" : "text-yellow-400",
      bgColor: metrics.avgWaitTime > 30 ? "bg-red-500/10" : "bg-yellow-500/10",
      borderColor: metrics.avgWaitTime > 30 ? "border-red-500/20" : "border-yellow-500/20"
    },
    {
      title: "Table Occupancy",
      value: `${metrics.tableOccupancy}%`,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Kitchen Efficiency",
      value: `${metrics.kitchenEfficiency}%`,
      icon: ChefHat,
      color: metrics.kitchenEfficiency >= 90 ? "text-green-400" : "text-orange-400",
      bgColor: metrics.kitchenEfficiency >= 90 ? "bg-green-500/10" : "bg-orange-500/10",
      borderColor: metrics.kitchenEfficiency >= 90 ? "border-green-500/20" : "border-orange-500/20"
    },
    {
      title: "Customer Rating",
      value: metrics.customerSatisfaction.toFixed(1),
      icon: Star,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      title: "Staff Performance",
      value: `${metrics.staffPerformance}%`,
      icon: TrendingUp,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20"
    }
  ]

  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {metricsData.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`glass-card ${metric.bgColor} ${metric.borderColor} border hover:scale-105 transition-transform duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <motion.div 
                className={`text-2xl font-bold ${metric.color}`}
                key={metric.value}
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {metric.value}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">
                Live Update
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}