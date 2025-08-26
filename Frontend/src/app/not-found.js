'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Home, Zap } from 'lucide-react'

export default function NotFoundPage() {

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center space-y-8 max-w-md"
      >
        {/* 404 Text */}
        <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          404
        </h1>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Page Not Found
          </h2>
          <p className="text-slate-400">
            The page you're looking for doesn't exist.
          </p>
        </div>

        {/* Dashboard Button */}
        <Link href="/dashboard">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Button>
        </Link>

        {/* Brand */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">AURA 2030</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}