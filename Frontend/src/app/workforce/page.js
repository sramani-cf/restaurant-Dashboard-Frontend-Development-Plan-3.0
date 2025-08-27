'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { STAFF_DATA } from '@/constants/demo-data'
import { formatCurrency } from '@/lib/utils'
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Target
} from 'lucide-react'

export default function WorkforcePage() {
  const [selectedView, setSelectedView] = useState('overview') // 'overview', 'staff', 'schedule', 'performance'

  const getRoleColor = (role) => {
    switch (role) {
      case 'Head Chef': return 'text-purple-400 bg-purple-500/20'
      case 'Sous Chef': return 'text-blue-400 bg-blue-500/20'
      case 'Server': return 'text-green-400 bg-green-500/20'
      case 'Bartender': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getPerformanceColor = (performance) => {
    if (performance >= 90) return 'text-green-400'
    if (performance >= 80) return 'text-blue-400'
    if (performance >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Schedule data for demo
  const scheduleData = [
    { day: 'Monday', date: 'Jan 22', staff: ['Sarah Johnson', 'Mike Chen', 'Emma Davis'], coverage: '100%' },
    { day: 'Tuesday', date: 'Jan 23', staff: ['Sarah Johnson', 'Tom Wilson', 'Lisa Parker'], coverage: '90%' },
    { day: 'Wednesday', date: 'Jan 24', staff: ['Mike Chen', 'Emma Davis', 'Tom Wilson'], coverage: '95%' },
    { day: 'Thursday', date: 'Jan 25', staff: ['Sarah Johnson', 'Emma Davis', 'Lisa Parker'], coverage: '100%' },
    { day: 'Friday', date: 'Jan 26', staff: ['Sarah Johnson', 'Mike Chen', 'Tom Wilson', 'Emma Davis'], coverage: '110%' },
    { day: 'Saturday', date: 'Jan 27', staff: ['All Staff', 'Weekend Boost'], coverage: '125%' },
    { day: 'Sunday', date: 'Jan 28', staff: ['Sarah Johnson', 'Tom Wilson', 'Emma Davis'], coverage: '95%' },
  ]

  const totalStaff = STAFF_DATA.length
  const avgPerformance = Math.round(STAFF_DATA.reduce((sum, staff) => sum + staff.performance, 0) / totalStaff)
  const estimatedPayroll = 45000 // Demo data
  const laborCostPercentage = 31.2

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workforce Management</h1>
            <p className="text-muted-foreground">
              Staff scheduling, performance tracking, and HR management
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
              variant={selectedView === 'staff' ? 'default' : 'outline'}
              onClick={() => setSelectedView('staff')}
            >
              <Award className="h-4 w-4 mr-2" />
              Staff
            </Button>
            <Button
              variant={selectedView === 'schedule' ? 'default' : 'outline'}
              onClick={() => setSelectedView('schedule')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button className="bg-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Workforce Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStaff}</p>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-xs text-blue-400">All positions filled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Target className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgPerformance}%</p>
                  <p className="text-sm text-muted-foreground">Avg Performance</p>
                  <p className="text-xs text-green-400">+5% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(estimatedPayroll)}</p>
                  <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                  <p className="text-xs text-yellow-400">{laborCostPercentage}% of sales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Clock className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Hours This Week</p>
                  <p className="text-xs text-purple-400">On target</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedView === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Alerts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Performance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-green-400" />
                      <span className="font-medium text-green-400">Top Performer</span>
                    </div>
                    <p className="text-sm">Sarah Johnson - 95% performance</p>
                    <p className="text-xs text-muted-foreground">Exceeding all KPIs</p>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-blue-400">Improving</span>
                    </div>
                    <p className="text-sm">Emma Davis - +8% this month</p>
                    <p className="text-xs text-muted-foreground">Great progress on service times</p>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium text-yellow-400">Schedule Gap</span>
                    </div>
                    <p className="text-sm">Tuesday lunch shift</p>
                    <p className="text-xs text-muted-foreground">Need additional server coverage</p>
                  </div>
                </div>
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
                    <Clock className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-sm font-medium">Shift completed</p>
                      <p className="text-xs text-muted-foreground">Mike Chen - Evening shift</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Users className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium">Schedule updated</p>
                      <p className="text-xs text-muted-foreground">Next week's schedule published</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Calendar className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium">Time off approved</p>
                      <p className="text-xs text-muted-foreground">Emma Davis - Jan 30-31</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Generate Schedule
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payroll
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Award className="h-4 w-4 mr-2" />
                    Performance Review
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Staff Meeting
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Time Tracking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedView === 'staff' ? (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search staff members..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:border-primary"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Staff List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Staff Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {STAFF_DATA.map((staff) => {
                    const roleColor = getRoleColor(staff.role)
                    const performanceColor = getPerformanceColor(staff.performance)

                    return (
                      <div key={staff.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{staff.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                                {staff.role}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {staff.shift}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className={`text-2xl font-bold ${performanceColor}`}>
                              {staff.performance}%
                            </p>
                            <p className="text-sm text-muted-foreground">Performance</p>
                          </div>

                          <div className="w-32">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Rating</span>
                              <span className={performanceColor}>{staff.performance}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  staff.performance >= 90 ? 'bg-green-500' :
                                  staff.performance >= 80 ? 'bg-blue-500' :
                                  staff.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${staff.performance}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Schedule
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
          /* Schedule View */
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Schedule</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Previous Week
                  </Button>
                  <Button variant="outline" size="sm">
                    Next Week
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Auto-Generate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduleData.map((day, index) => (
                  <div key={index} className="p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{day.day}</h3>
                        <p className="text-sm text-muted-foreground">{day.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          parseFloat(day.coverage) >= 100 ? 'bg-green-500/20 text-green-400' :
                          parseFloat(day.coverage) >= 90 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {day.coverage} Coverage
                        </span>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.staff.map((staffMember, staffIndex) => (
                        <span
                          key={staffIndex}
                          className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm"
                        >
                          {staffMember}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}