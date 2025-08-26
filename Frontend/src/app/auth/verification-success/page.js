'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Settings,
  BarChart3
} from 'lucide-react'

export default function VerificationSuccessPage() {
  // Auto redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/dashboard'
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.3
      }
    }
  }

  const sparkleVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        staggerChildren: 0.2
      }
    }
  }

  const features = [
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Real-time insights and performance metrics'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage staff and permissions efficiently'
    },
    {
      icon: Settings,
      title: 'System Configuration',
      description: 'Customize your neural restaurant setup'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={sparkleVariants}
          animate="animate"
          className="absolute top-1/4 left-1/4"
        >
          <Sparkles className="h-6 w-6 text-cyan-400/50" />
        </motion.div>
        <motion.div
          variants={sparkleVariants}
          animate="animate"
          className="absolute top-1/3 right-1/3"
          style={{ animationDelay: '0.5s' }}
        >
          <Sparkles className="h-4 w-4 text-purple-400/50" />
        </motion.div>
        <motion.div
          variants={sparkleVariants}
          animate="animate"
          className="absolute bottom-1/3 left-1/3"
          style={{ animationDelay: '1s' }}
        >
          <Sparkles className="h-5 w-5 text-blue-400/50" />
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 mb-4">
            <Zap className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold holo-text mb-2">AURA 2030</h1>
          <p className="text-slate-400 text-sm font-mono">Neural Restaurant OS</p>
        </motion.div>

        {/* Success Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-enhanced border-green-500/20">
            <CardHeader className="space-y-6 text-center pb-6">
              {/* Success Icon */}
              <div className="mx-auto">
                <motion.div
                  variants={successVariants}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/30 flex items-center justify-center relative"
                >
                  <CheckCircle className="h-12 w-12 text-green-300" />
                  
                  {/* Animated Ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 rounded-full border-2 border-green-400"
                  />
                </motion.div>
              </div>

              <div className="space-y-3">
                <CardTitle className="text-3xl font-bold text-white">Welcome Aboard!</CardTitle>
                <p className="text-green-300 font-medium">Your account has been successfully verified</p>
                <p className="text-slate-400">
                  You're now part of the neural restaurant revolution. Get ready to experience the future of restaurant management.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* What's Next Section */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-4">What's next?</h3>
                </div>

                <div className="grid gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-cyan-500/10 hover:border-cyan-500/20 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-cyan-300" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{feature.title}</h4>
                          <p className="text-sm text-slate-400">{feature.description}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="space-y-4">
                <Link href="/dashboard">
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25"
                  >
                    Enter Neural Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link href="/settings">
                    <Button
                      variant="outline"
                      className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Setup
                    </Button>
                  </Link>
                  <Link href="/help">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-white/5"
                    >
                      Help Guide
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Auto Redirect Notice */}
              <motion.div variants={itemVariants} className="text-center border-t border-slate-700 pt-6">
                <p className="text-sm text-slate-400">
                  You'll be automatically redirected to the dashboard in{' '}
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-cyan-300 font-medium"
                  >
                    10 seconds
                  </motion.span>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Badge */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-300 font-medium">Account Fully Verified</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}