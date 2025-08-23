'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Monitor,
  Zap,
  Activity,
  Cpu,
  Shield,
  Radio
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    name: 'Command Center',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Neural operations hub',
    color: 'from-cyan-400 to-blue-500',
    preview: { sales: '+12.3%', orders: '342', alerts: 2 }
  },
  {
    name: 'Neural POS',
    href: '/pos',
    icon: CreditCard,
    description: 'Quantum transaction matrix',
    color: 'from-purple-400 to-pink-500',
    preview: { active: '18 orders', total: '$2,847', avg: '$158' }
  },
  {
    name: 'Spatial Manager',
    href: '/reservations',
    icon: Calendar,
    description: 'Holographic seating grid',
    color: 'from-green-400 to-teal-500',
    preview: { occupancy: '85%', waiting: 5, next: '7:30 PM' }
  },
  {
    name: 'Culinary Matrix',
    href: '/menu',
    icon: ChefHat,
    description: 'Recipe engineering core',
    color: 'from-orange-400 to-red-500',
    preview: { stars: 4, profit: '68%', items: 47 }
  },
  {
    name: 'Kitchen Neural',
    href: '/kitchen',
    icon: Monitor,
    description: 'Preparation synchronizer',
    color: 'from-yellow-400 to-orange-500',
    preview: { queue: 8, avg: '12m', ready: 3 }
  },
  {
    name: 'Supply Chain',
    href: '/inventory',
    icon: Package,
    description: 'Molecular tracking grid',
    color: 'from-indigo-400 to-purple-500',
    preview: { stock: '94%', alerts: 2, value: '$45.2K' }
  },
  {
    name: 'Human Resources',
    href: '/workforce',
    icon: Users,
    description: 'Personnel optimization',
    color: 'from-pink-400 to-rose-500',
    preview: { active: 12, performance: '89%', schedule: '✓' }
  },
  {
    name: 'Data Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Intelligence synthesis',
    color: 'from-teal-400 to-cyan-500',
    preview: { growth: '+15.7%', insights: 8, trends: '↗' }
  },
  {
    name: 'Guest Profiles',
    href: '/customers',
    icon: UserCheck,
    description: 'Relationship matrix',
    color: 'from-violet-400 to-purple-500',
    preview: { loyalty: '78%', new: 23, rating: '4.8⭐' }
  },
  {
    name: 'System Config',
    href: '/settings',
    icon: Settings,
    description: 'Core parameters',
    color: 'from-gray-400 to-slate-500',
    preview: { status: 'Optimal', uptime: '99.9%', security: '🔒' }
  }
]

export function ResponsiveSidebar({ isMobile = false, onClose = () => {} }) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [systemHealth, setSystemHealth] = useState(98)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time and system health
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setSystemHealth(prev => 
        Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 2))
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "h-screen w-full border-r border-cyan-500/20 flex flex-col",
        // Desktop: Glass effect with blur
        !isMobile && "glass-card-enhanced",
        // Mobile: Solid background with custom class
        isMobile && "mobile-sidebar bg-slate-900"
      )}
      style={{
        background: isMobile 
          ? `linear-gradient(135deg, rgb(15, 20, 25) 0%, rgb(30, 35, 45) 50%, rgb(15, 20, 25) 100%)`
          : `
              radial-gradient(circle at 50% 0%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
              rgba(15, 20, 25, 0.6)
            `
      }}
    >
      <div className="flex h-screen flex-col relative overflow-hidden">
        
        {/* Quantum Logo Header */}
        <motion.div 
          className="flex h-20 shrink-0 items-center px-6 border-b border-cyan-500/20 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center gap-4 relative z-10">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center relative quantum-glow"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Zap className="text-white font-bold text-lg drop-shadow-lg" />
            </motion.div>
            <div>
              <motion.h1 
                className="text-xl font-bold holo-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                AURA 2030
              </motion.h1>
              <motion.p 
                className="text-xs text-cyan-300/80 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Neural Restaurant OS
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent relative">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <motion.div
                key={item.name}
                variants={itemVariants}
                className="relative flex-shrink-0"
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  onClick={() => isMobile && onClose()}
                  className={cn(
                    "sidebar-nav-item group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                      : "text-slate-300 hover:text-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-purple-500/10"
                  )}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <motion.div
                    className={cn(
                      "relative p-2 rounded-lg transition-all duration-300 flex-shrink-0",
                      `bg-gradient-to-r ${item.color}`,
                      isActive ? 'shadow-lg shadow-current/50' : 'opacity-70 group-hover:opacity-100'
                    )}
                    whileHover={{ rotate: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5 text-white drop-shadow-lg" />
                  </motion.div>
                  
                  <div className="flex flex-col flex-1">
                    <span className={cn(
                      "font-semibold transition-colors",
                      isActive && "text-cyan-300"
                    )}>
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.description}
                    </span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-3 top-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 pulse-glow"
                      style={{ y: '-50%' }}
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>

                {/* Preview tooltip for desktop - Fixed positioning */}
                <AnimatePresence>
                  {hoveredItem === item.name && !isMobile && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -10 }}
                      className="sidebar-tooltip fixed left-80 p-3 rounded-lg bg-slate-800 border border-cyan-500/30 w-48"
                      style={{
                        top: `${index * 65 + 140}px`
                      }}
                    >
                      <h4 className="text-sm font-semibold text-cyan-300 mb-2">{item.name} Status</h4>
                      <div className="space-y-1 text-xs">
                        {Object.entries(item.preview).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-slate-400 capitalize">{key}:</span>
                            <span className="text-white font-mono">{value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </nav>

        {/* System Status Footer */}
        <motion.div 
          className="p-4 border-t border-cyan-500/20 bg-gradient-to-t from-black/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* System Health Monitor */}
          <div className="mb-4 p-3 rounded-lg glass border border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-300">SYSTEM STATUS</span>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-400" />
                <span className="text-xs font-mono text-green-400">OPTIMAL</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Health</span>
                  <span className="text-cyan-300 font-mono">{systemHealth.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-cyan-400 h-1 rounded-full"
                    style={{ width: `${systemHealth}%` }}
                    animate={{ width: `${systemHealth}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <motion.div 
                className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center pulse-glow"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Cpu className="h-4 w-4 text-white" />
              </motion.div>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-lg glass border border-cyan-500/20">
            <motion.div 
              className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center relative"
              whileHover={{ scale: 1.1 }}
            >
              <Shield className="h-5 w-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-black/20" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Neural Admin</p>
              <p className="text-xs text-cyan-300 font-mono truncate">Level-9 Clearance</p>
            </div>
            <motion.div
              whileHover={{ rotate: 90 }}
              className="text-cyan-300"
            >
              <Radio className="h-4 w-4" />
            </motion.div>
          </div>

          {/* Real-time Clock */}
          <div className="mt-3 text-center">
            <motion.div 
              className="text-lg font-mono font-bold holo-text"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentTime.toLocaleTimeString()}
            </motion.div>
            <div className="text-xs text-slate-400 font-mono">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </motion.div>
      </div>

    </motion.div>
  )
}