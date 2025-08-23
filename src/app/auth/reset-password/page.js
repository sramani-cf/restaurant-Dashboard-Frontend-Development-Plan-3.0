'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  Mail,
  CheckCircle,
  KeyRound,
  AlertCircle,
  Lock
} from 'lucide-react'

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1) // 1: Email input, 2: Email sent confirmation
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate password reset request
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
    }, 2000)
  }

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

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -50,
      transition: { duration: 0.3 }
    }
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </motion.div>

        {/* Logo Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 mb-4">
            <Zap className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold holo-text mb-2">AURA 2030</h1>
          <p className="text-slate-400 text-sm font-mono">Neural Restaurant OS</p>
        </motion.div>

        {/* Reset Password Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-enhanced border-cyan-500/20">
            {step === 1 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <CardHeader className="space-y-4 text-center pb-6">
                  {/* Key Icon */}
                  <div className="mx-auto">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 flex items-center justify-center">
                      <KeyRound className="h-10 w-10 text-orange-300" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
                    <p className="text-slate-400">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your registered email"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-cyan-500/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-300/50 transition-all duration-300"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Security Note */}
                    <motion.div variants={itemVariants} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-300">Security Note</p>
                          <p className="text-sm text-slate-300">
                            For your security, the reset link will expire in 1 hour and can only be used once.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Reset Button */}
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            Send Reset Link
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Help Links */}
                  <motion.div variants={itemVariants} className="border-t border-slate-700 pt-6">
                    <div className="text-center space-y-3">
                      <p className="text-sm text-slate-400">Remember your password?</p>
                      <Link
                        href="/auth/login"
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                      >
                        Back to login
                      </Link>
                    </div>
                  </motion.div>
                </CardContent>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
              >
                <CardHeader className="space-y-4 text-center pb-6">
                  {/* Success Icon */}
                  <div className="mx-auto">
                    <motion.div
                      variants={pulseVariants}
                      animate="pulse"
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 flex items-center justify-center"
                    >
                      <CheckCircle className="h-10 w-10 text-green-300" />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
                    <p className="text-slate-400">
                      We've sent a password reset link to
                    </p>
                    <p className="text-cyan-300 font-medium">{email}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Instructions */}
                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-green-300">Next Steps:</p>
                          <ul className="text-sm text-slate-300 space-y-1 ml-0">
                            <li>• Check your inbox for the reset email</li>
                            <li>• Click the "Reset Password" link</li>
                            <li>• Create a new strong password</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Didn't receive email */}
                  <motion.div variants={itemVariants} className="text-center space-y-4">
                    <p className="text-sm text-slate-400">
                      Didn't receive the email? Check your spam folder.
                    </p>
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                    >
                      Try different email
                    </Button>
                  </motion.div>

                  {/* Additional Help */}
                  <motion.div variants={itemVariants} className="border-t border-slate-700 pt-6">
                    <div className="text-center space-y-3">
                      <p className="text-sm text-slate-400">Still need help?</p>
                      <div className="flex justify-center gap-4">
                        <Link
                          href="/auth/login"
                          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Back to login
                        </Link>
                        <span className="text-slate-600">•</span>
                        <Link
                          href="/support"
                          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Contact support
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Security Badge */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-300 font-medium">Secure Password Reset</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}