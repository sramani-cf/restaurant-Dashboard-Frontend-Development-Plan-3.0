import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({ title, value, change, icon: Icon, trend = 'up', className }) {
  const isPositive = trend === 'up'
  
  return (
    <Card className={cn("glass-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "text-xs flex items-center gap-1",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            <span className={cn(
              "inline-block w-0 h-0 border-l-2 border-r-2 border-transparent",
              isPositive ? "border-b-4 border-b-green-400" : "border-t-4 border-t-red-400"
            )} />
            {change} from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}