'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CUSTOMER_DATA } from '@/constants/demo-data'
import { formatCurrency } from '@/lib/utils'
import {
  Users,
  Star,
  Mail,
  Phone,
  Calendar,
  Gift,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Crown,
  Award,
  Heart
} from 'lucide-react'

export default function CustomersPage() {
  const [selectedView, setSelectedView] = useState('overview') // 'overview', 'customers', 'loyalty'
  const [searchTerm, setSearchTerm] = useState('')

  const getLoyaltyColor = (tier) => {
    switch (tier) {
      case 'Platinum': return 'text-purple-400 bg-purple-500/20'
      case 'Gold': return 'text-yellow-400 bg-yellow-500/20'
      case 'Silver': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-blue-400 bg-blue-500/20'
    }
  }

  const getLoyaltyIcon = (tier) => {
    switch (tier) {
      case 'Platinum': return Crown
      case 'Gold': return Award
      case 'Silver': return Star
      default: return Heart
    }
  }

  const totalCustomers = CUSTOMER_DATA.length
  const totalRevenue = CUSTOMER_DATA.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const avgCustomerValue = totalRevenue / totalCustomers
  const loyaltyDistribution = CUSTOMER_DATA.reduce((acc, customer) => {
    acc[customer.loyalty] = (acc[customer.loyalty] || 0) + 1
    return acc
  }, {})

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Relationship</h1>
            <p className="text-muted-foreground">
              CRM, loyalty programs, and customer insights
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={selectedView === 'overview' ? 'default' : 'outline'}
              onClick={() => setSelectedView('overview')}
            >
              <Users className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={selectedView === 'customers' ? 'default' : 'outline'}
              onClick={() => setSelectedView('customers')}
            >
              <Star className="h-4 w-4 mr-2" />
              Customers
            </Button>
            <Button
              variant={selectedView === 'loyalty' ? 'default' : 'outline'}
              onClick={() => setSelectedView('loyalty')}
            >
              <Gift className="h-4 w-4 mr-2" />
              Loyalty
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCustomers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-xs text-blue-400">+12% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(avgCustomerValue)}</p>
                  <p className="text-sm text-muted-foreground">Avg Customer Value</p>
                  <p className="text-xs text-green-400">+8% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Crown className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loyaltyDistribution['Platinum'] || 0}</p>
                  <p className="text-sm text-muted-foreground">Platinum Members</p>
                  <p className="text-xs text-purple-400">Top tier customers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.7</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-xs text-yellow-400">Customer satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedView === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New customer registered</p>
                      <p className="text-xs text-muted-foreground">Sarah Wilson - 2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Star className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Loyalty tier upgraded</p>
                      <p className="text-xs text-muted-foreground">David Smith → Platinum</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Birthday email sent</p>
                      <p className="text-xs text-muted-foreground">Maria Garcia - Special offer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Program Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Loyalty Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(loyaltyDistribution).map(([tier, count]) => {
                    const color = getLoyaltyColor(tier)
                    const Icon = getLoyaltyIcon(tier)
                    
                    return (
                      <div key={tier} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{tier}</span>
                        </div>
                        <span className="text-2xl font-bold">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <p className="text-sm text-muted-foreground">Highest value customers</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CUSTOMER_DATA.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5).map((customer, index) => {
                    const Icon = getLoyaltyIcon(customer.loyalty)
                    
                    return (
                      <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{customer.name}</p>
                            <div className="flex items-center gap-2">
                              <Icon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{customer.loyalty}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{formatCurrency(customer.totalSpent)}</p>
                          <p className="text-xs text-muted-foreground">{customer.visits} visits</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedView === 'customers' ? (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customers..."
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

            {/* Customer List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Customer Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CUSTOMER_DATA.filter(customer =>
                    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((customer) => {
                    const Icon = getLoyaltyIcon(customer.loyalty)
                    const loyaltyColor = getLoyaltyColor(customer.loyalty)
                    
                    return (
                      <div key={customer.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold">{customer.name}</h3>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Last visit: {customer.lastVisit}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {customer.visits} visits
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(customer.totalSpent)}</p>
                            <p className="text-sm text-muted-foreground">
                              Avg: {formatCurrency(customer.avgCheck)}
                            </p>
                          </div>

                          <div className={`p-2 rounded-lg ${loyaltyColor} flex items-center gap-2`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{customer.loyalty}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm">
                              View Profile
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
          /* Loyalty Program Management */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Loyalty Program Settings</CardTitle>
                <p className="text-sm text-muted-foreground">Configure loyalty tiers and rewards</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="h-5 w-5 text-purple-400" />
                      <h4 className="font-semibold text-purple-400">Platinum Tier</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>• Minimum spend: $5,000+</p>
                      <p>• 15% discount on all orders</p>
                      <p>• Exclusive menu previews</p>
                      <p>• Priority reservations</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="h-5 w-5 text-yellow-400" />
                      <h4 className="font-semibold text-yellow-400">Gold Tier</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>• Minimum spend: $2,500+</p>
                      <p>• 10% discount on all orders</p>
                      <p>• Birthday rewards</p>
                      <p>• Special event invitations</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-500/30 bg-gray-500/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="h-5 w-5 text-gray-400" />
                      <h4 className="font-semibold text-gray-400">Silver Tier</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>• Minimum spend: $1,000+</p>
                      <p>• 5% discount on all orders</p>
                      <p>• Loyalty points earning</p>
                      <p>• Monthly newsletters</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Active Promotions</CardTitle>
                <p className="text-sm text-muted-foreground">Current loyalty campaigns</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-400">Birthday Special</h4>
                      <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full text-green-400">Active</span>
                    </div>
                    <p className="text-sm mb-2">Free dessert on birthday month</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Redeemed: 47 times</span>
                      <span>Expires: Dec 31, 2024</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-400">Referral Bonus</h4>
                      <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-full text-blue-400">Active</span>
                    </div>
                    <p className="text-sm mb-2">$20 credit for each referral</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Redeemed: 23 times</span>
                      <span>Ongoing promotion</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-yellow-400">Weekend Boost</h4>
                      <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded-full text-yellow-400">Active</span>
                    </div>
                    <p className="text-sm mb-2">2x points on weekend dining</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg boost: 85 points</span>
                      <span>Weekends only</span>
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Create New Promotion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}