'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Wifi,
  CreditCard,
  Globe,
  Smartphone,
  Save,
  RefreshCw
} from 'lucide-react'

export default function SettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState('general')

  const categories = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'users', name: 'User Management', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'integrations', name: 'Integrations', icon: Database },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ]

  const integrations = [
    {
      name: 'QuickBooks',
      description: 'Accounting and financial management',
      status: 'connected',
      icon: '📊'
    },
    {
      name: 'DoorDash',
      description: 'Food delivery service integration',
      status: 'connected',
      icon: '🚚'
    },
    {
      name: 'Uber Eats',
      description: 'Online food ordering platform',
      status: 'disconnected',
      icon: '🍔'
    },
    {
      name: 'OpenTable',
      description: 'Reservation management system',
      status: 'connected',
      icon: '🍽️'
    },
    {
      name: 'Square',
      description: 'Payment processing integration',
      status: 'connected',
      icon: '💳'
    },
    {
      name: 'Mailchimp',
      description: 'Email marketing automation',
      status: 'disconnected',
      icon: '📧'
    }
  ]

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'general':
        return (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                    <input
                      type="text"
                      defaultValue="Aura Restaurant"
                      className="w-full p-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      defaultValue="Downtown Seattle"
                      className="w-full p-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="(206) 555-0123"
                      className="w-full p-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cuisine Type</label>
                    <select className="w-full p-2 rounded-lg border border-white/10 bg-white/5 focus:outline-none focus:border-primary">
                      <option>Fine Dining</option>
                      <option>Casual Dining</option>
                      <option>Fast Casual</option>
                      <option>Quick Service</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                      <span className="font-medium w-20">{day}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          defaultValue="11:00"
                          className="p-1 rounded border border-white/10 bg-white/5 focus:outline-none focus:border-primary"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          defaultValue="22:00"
                          className="p-1 rounded border border-white/10 bg-white/5 focus:outline-none focus:border-primary"
                        />
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Open</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'users':
        return (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Roles & Permissions</CardTitle>
                  <Button className="bg-primary hover:bg-primary/90">
                    <User className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Owner', users: 1, permissions: 'Full access to all modules and settings' },
                    { name: 'General Manager', users: 2, permissions: 'Access to operations, staff, and reports' },
                    { name: 'Head Chef', users: 1, permissions: 'Kitchen, inventory, and menu management' },
                    { name: 'Server', users: 8, permissions: 'POS, reservations, and customer management' },
                    { name: 'Host', users: 3, permissions: 'Reservations and floor plan management' }
                  ].map((role, index) => (
                    <div key={index} className="p-4 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{role.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{role.users} users</span>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.permissions}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <select className="p-2 rounded border border-white/10 bg-white/5 focus:outline-none focus:border-primary">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <h4 className="font-medium">Password Policy</h4>
                    <p className="text-sm text-muted-foreground">Enforce strong passwords</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
                <p className="text-sm text-muted-foreground">Connect with external services to streamline operations</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrations.map((integration, index) => (
                    <div key={index} className="p-4 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <h4 className="font-semibold">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          integration.status === 'connected' 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {integration.status}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        className="w-full"
                      >
                        {integration.status === 'connected' ? 'Configure' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Order Alerts', description: 'Get notified about new orders and updates' },
                  { title: 'Inventory Warnings', description: 'Alerts for low stock and critical inventory levels' },
                  { title: 'Staff Updates', description: 'Notifications about schedule changes and time-off requests' },
                  { title: 'Customer Feedback', description: 'New reviews and customer satisfaction alerts' },
                  { title: 'Financial Reports', description: 'Daily sales summaries and weekly reports' },
                  { title: 'System Maintenance', description: 'Updates about system maintenance and downtime' }
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked />
                        Email
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked />
                        SMS
                      </label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-lg border border-primary/30 bg-primary/10 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">Professional Plan</h3>
                      <p className="text-muted-foreground">Full restaurant management suite</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">$299</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>✓ Unlimited POS terminals</p>
                    <p>✓ Advanced analytics & reporting</p>
                    <p>✓ Multi-location management</p>
                    <p>✓ 24/7 priority support</p>
                    <p>✓ All integrations included</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Payment Method</h4>
                    <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/26</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Billing History</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm p-2 rounded bg-white/5">
                        <span>Jan 2024</span>
                        <span>$299.00</span>
                      </div>
                      <div className="flex justify-between text-sm p-2 rounded bg-white/5">
                        <span>Dec 2023</span>
                        <span>$299.00</span>
                      </div>
                      <div className="flex justify-between text-sm p-2 rounded bg-white/5">
                        <span>Nov 2023</span>
                        <span>$299.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return <div>Select a category to view settings</div>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              System configuration and preferences
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button className="bg-blue-800">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Categories */}
          <Card className="glass-card lg:col-span-1">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderCategoryContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}