'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SalesChart({ data, title = "Sales Overview", description = "Weekly sales performance" }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#a1a1aa"
              fontSize={12}
            />
            <YAxis 
              stroke="#a1a1aa"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}