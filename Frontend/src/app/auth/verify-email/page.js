'use client'

import { useState, useEffect } from 'react'
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
  RefreshCw,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [emailSent, setEmailSent] = useState(true)

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [timeLeft, canResend])

  const handleResendEmail = async () => {
    setIsResending(true)
    // Simulate resend process
    setTimeout(() => {
      setIsResending(false)
      setEmailSent(true)
      setTimeLeft(60)
      setCanResend(false)
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
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to signup
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

        {/* Email Verification Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-enhanced border-cyan-500/20">
            <CardHeader className="space-y-4 text-center pb-6">
              {/* Email Icon */}
              <div className="mx-auto">
                <motion.div
                  variants={pulseVariants}
                  animate="pulse"
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center"
                >
                  <Mail className="h-10 w-10 text-cyan-300" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
                <p className="text-slate-400">
                  We've sent a verification link to
                </p>
                <p className="text-cyan-300 font-medium">john@example.com</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Instructions */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-300">Next Steps:</p>
                      <ul className="text-sm text-slate-300 space-y-1 ml-0">
                        <li>• Check your inbox for our verification email</li>
                        <li>• Click the "Verify Email" button in the email</li>
                        <li>• You'll be redirected back to complete setup</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Resend Section */}
              <motion.div variants={itemVariants} className="text-center space-y-4">
                <div className="text-sm text-slate-400">
                  Didn't receive the email? Check your spam folder.
                </div>

                {!canResend ? (
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>Resend available in {timeLeft}s</span>
                  </div>
                ) : (
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                    disabled={isResending}
                  >
                    {isResending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Resend verification email
                  </Button>
                )}
              </motion.div>

              {/* Manual Verification Option */}
              <motion.div variants={itemVariants} className="border-t border-slate-700 pt-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-slate-400">
                    Already verified? Continue to your account
                  </p>
                  <Link href="/auth/verify-code">
                    <Button
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      Enter verification code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Alternative Actions */}
              <motion.div variants={itemVariants} className="border-t border-slate-700 pt-6">
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-400">Need help?</p>
                  <div className="flex justify-center gap-4">
                    <Link
                      href="/auth/signup"
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Use different email
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

              {/* Success Message */}
              {emailSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  variants={itemVariants}
                  className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-300">Email sent successfully!</p>
                      <p className="text-sm text-slate-400">Please check your inbox.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Badge */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-300 font-medium">Secure Email Verification</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}