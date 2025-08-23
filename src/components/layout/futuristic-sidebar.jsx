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
    glow: 'shadow-cyan-500/50',
    preview: { sales: '+12.3%', orders: '342', alerts: 2 }
  },
  {
    name: 'Neural POS',
    href: '/pos',
    icon: CreditCard,
    description: 'Quantum transaction matrix',
    color: 'from-purple-400 to-pink-500',
    glow: 'shadow-purple-500/50',
    preview: { active: '18 orders', total: '$2,847', avg: '$158' }
  },
  {
    name: 'Spatial Manager',
    href: '/reservations',
    icon: Calendar,
    description: 'Holographic seating grid',
    color: 'from-green-400 to-teal-500',
    glow: 'shadow-green-500/50',
    preview: { occupancy: '85%', waiting: 5, next: '7:30 PM' }
  },
  {
    name: 'Culinary Matrix',
    href: '/menu',
    icon: ChefHat,
    description: 'Recipe engineering core',
    color: 'from-orange-400 to-red-500',
    glow: 'shadow-orange-500/50',
    preview: { stars: 4, profit: '68%', items: 47 }
  },
  {
    name: 'Kitchen Neural',
    href: '/kitchen',
    icon: Monitor,
    description: 'Preparation synchronizer',
    color: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-500/50',
    preview: { queue: 8, avg: '12m', ready: 3 }
  },
  {
    name: 'Supply Chain',
    href: '/inventory',
    icon: Package,
    description: 'Molecular tracking grid',
    color: 'from-indigo-400 to-purple-500',
    glow: 'shadow-indigo-500/50',
    preview: { stock: '94%', alerts: 2, value: '$45.2K' }
  },
  {
    name: 'Human Resources',
    href: '/workforce',
    icon: Users,
    description: 'Personnel optimization',
    color: 'from-pink-400 to-rose-500',
    glow: 'shadow-pink-500/50',
    preview: { active: 12, performance: '89%', schedule: '✓' }
  },
  {
    name: 'Data Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Intelligence synthesis',
    color: 'from-teal-400 to-cyan-500',
    glow: 'shadow-teal-500/50',
    preview: { growth: '+15.7%', insights: 8, trends: '↗' }
  },
  {
    name: 'Guest Profiles',
    href: '/customers',
    icon: UserCheck,
    description: 'Relationship matrix',
    color: 'from-violet-400 to-purple-500',
    glow: 'shadow-violet-500/50',
    preview: { loyalty: '78%', new: 23, rating: '4.8⭐' }
  },
  {
    name: 'System Config',
    href: '/settings',
    icon: Settings,
    description: 'Core parameters',
    color: 'from-gray-400 to-slate-500',
    glow: 'shadow-gray-500/50',
    preview: { status: 'Optimal', uptime: '99.9%', security: '🔒' }
  }
]

export function FuturisticSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const containerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  }

  const previewVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: -20,
      transition: { duration: 0.2 }
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden glass-card holo-shimmer"
        onClick={toggleMobileMenu}
      >
        <motion.div
          animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.div>
      </Button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={cn(
          "w-80 h-screen transform transition-transform duration-500 ease-out glass-card border-r border-cyan-500/20",
          // Mobile: fixed positioning with slide animation
          "md:relative md:translate-x-0",
          "fixed left-0 top-0 z-40",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          background: `
            radial-gradient(circle at 50% 0%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            rgba(15, 20, 25, 0.4)
          `
        }}
      >
        <div className="flex h-full flex-col relative overflow-hidden">
          
          {/* Quantum Logo Header */}
          <motion.div 
            className="flex h-20 shrink-0 items-center px-6 border-b border-cyan-500/20 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center gap-4 relative z-10">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center relative quantum-glow"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                <Zap className="text-white font-bold text-lg drop-shadow-lg" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 animate-pulse opacity-50" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  AURA 2030
                </motion.h1>
                <motion.p 
                  className="text-xs text-cyan-300/80 font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Neural Restaurant OS
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  className="relative"
                  onHoverStart={() => setHoveredItem(item.name)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 neural-connector",
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                        : "text-slate-300 hover:text-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-purple-500/10"
                    )}
                  >
                    {/* Holographic background effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <motion.div
                      className={cn(
                        "relative p-2 rounded-lg transition-all duration-300",
                        `bg-gradient-to-r ${item.color}`,
                        isActive ? 'shadow-lg ' + item.glow : 'opacity-70 group-hover:opacity-100'
                      )}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
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
                        className="absolute right-2 top-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
                        style={{ y: '-50%' }}
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Hover Preview */}
                  <AnimatePresence>
                    {hoveredItem === item.name && (
                      <motion.div
                        variants={previewVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute left-full top-0 ml-4 p-3 rounded-lg glass-card border border-cyan-500/20 w-48 z-50"
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
            transition={{ delay: 1 }}
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
                className="text-lg font-mono font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
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

        {/* Particle Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </>
  )
}