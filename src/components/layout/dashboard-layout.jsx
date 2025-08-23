'use client'

import { ResponsiveSidebar } from './sidebar-responsive'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="dashboard-layout min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Desktop Sidebar - Fixed width, always visible */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-80 z-40">
        <ResponsiveSidebar isMobile={false} />
      </aside>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="glass border-cyan-500/30 hover:bg-cyan-500/10"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4 text-cyan-300" />
          ) : (
            <Menu className="h-4 w-4 text-cyan-300" />
          )}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 h-full w-80 z-50 mobile-sidebar"
              style={{
                background: 'linear-gradient(135deg, rgb(15, 20, 25) 0%, rgb(30, 35, 45) 50%, rgb(15, 20, 25) 100%)',
                borderRight: '1px solid rgba(0, 212, 255, 0.3)'
              }}
            >
              <ResponsiveSidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content - Offset by sidebar width on desktop */}
      <main className="md:ml-80 min-h-screen">
        <div className="h-full pt-16 md:pt-6 px-4 md:px-6 lg:px-8 pb-6">
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}