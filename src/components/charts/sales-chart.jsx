'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SalesChart({ data, title = "Sales Overview", description = "Weekly sales performance" }) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl truncate">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#a1a1aa"
              fontSize={10}
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#a1a1aa"
              fontSize={10}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
                return `$${value}`
              }}
              width={50}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}