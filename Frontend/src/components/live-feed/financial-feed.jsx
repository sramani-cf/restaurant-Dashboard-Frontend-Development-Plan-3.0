'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Trophy,
  RefreshCw,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function FinancialFeed({ stream, className = "" }) {
  const getTransactionIcon = (type, paymentMethod) => {
    if (type === 'milestone') return Trophy
    if (type === 'refund') return RefreshCw
    
    switch (paymentMethod) {
      case 'Credit Card': return CreditCard
      case 'Cash': return Banknote
      case 'Mobile Pay': return Smartphone
      default: return DollarSign
    }
  }

  const getTransactionColor = (type, amount) => {
    if (type === 'milestone') return 'text-purple-400'
    if (type === 'refund' || amount < 0) return 'text-red-400'
    return 'text-green-400'
  }

  const getBadgeColor = (type) => {
    switch (type) {
      case 'sale': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'milestone': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'refund': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const formatTransactionType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'Credit Card': return 'text-blue-400'
      case 'Cash': return 'text-green-400'
      case 'Mobile Pay': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-green-400" />
          Financial Stream
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {stream.map((transaction, index) => {
            const TransactionIcon = getTransactionIcon(transaction.type, transaction.paymentMethod)
            const transactionColor = getTransactionColor(transaction.type, transaction.amount)
            const isPositive = transaction.amount > 0
            
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${
                  transaction.type === 'milestone' ? 'border-purple-500/30 bg-purple-500/5' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TransactionIcon className={`h-4 w-4 ${transactionColor}`} />
                    <Badge className={getBadgeColor(transaction.type)}>
                      {formatTransactionType(transaction.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${transactionColor}`}>
                      {isPositive ? '+' : ''}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>

                {/* Transaction Details */}
                {transaction.type === 'milestone' ? (
                  <div className="mb-2">
                    <p className="text-sm text-purple-300">
                      🎉 {transaction.details}
                    </p>
                  </div>
                ) : (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {transaction.table && (
                        <span>Table {transaction.table}</span>
                      )}
                      {transaction.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className={getPaymentMethodColor(transaction.paymentMethod)}>
                            {transaction.paymentMethod}
                          </span>
                        </>
                      )}
                    </div>
                    {transaction.reason && (
                      <p className="text-xs text-red-300 mt-1">
                        Reason: {transaction.reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {transaction.timestamp}
                  </div>
                  {transaction.server && (
                    <span className="text-cyan-400">
                      {transaction.server}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {stream.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent financial activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}