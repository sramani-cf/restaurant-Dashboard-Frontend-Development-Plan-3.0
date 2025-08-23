'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  ChefHat,
  Package,
  Users,
  BarChart3,
  UserCheck,
  Settings,
  Menu,
  X,
  Monitor
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    name: 'Command Center',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Main operations dashboard'
  },
  {
    name: 'Point of Sale',
    href: '/pos',
    icon: CreditCard,
    description: 'POS terminal interface'
  },
  {
    name: 'Reservations',
    href: '/reservations',
    icon: Calendar,
    description: 'Table management & bookings'
  },
  {
    name: 'Menu Management',
    href: '/menu',
    icon: ChefHat,
    description: 'Menu engineering & recipes'
  },
  {
    name: 'Kitchen Display',
    href: '/kitchen',
    icon: Monitor,
    description: 'Kitchen Display System'
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    description: 'Stock & supply chain'
  },
  {
    name: 'Workforce',
    href: '/workforce',
    icon: Users,
    description: 'Staff management & scheduling'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Business intelligence & reports'
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: UserCheck,
    description: 'CRM & loyalty programs'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration'
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden glass-card"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-72 transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "glass-card border-r border-white/10"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold">Aura</h1>
                <p className="text-xs text-muted-foreground">Restaurant Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-white/10",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className={cn("font-medium", isActive && "text-primary")}>{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">GM</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">General Manager</p>
                <p className="text-xs text-muted-foreground truncate">Seattle Downtown</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}