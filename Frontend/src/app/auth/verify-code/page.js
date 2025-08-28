'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { apiService } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Clock
} from 'lucide-react'

export default function VerifyCodePage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [resendError, setResendError] = useState('')
  const inputRefs = useRef([])

  // Load user data from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('verificationEmail')
      const name = sessionStorage.getItem('userName')
      if (email) {
        setUserEmail(email)
        setUserName(name || email)
      } else {
        // Redirect to signup if no email found
        window.location.href = '/auth/signup'
      }
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [timeLeft, canResend])

  const handleInputChange = (index, value) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const verificationCode = code.join('')
    if (verificationCode.length !== 6 || !userEmail) return

    setIsLoading(true)
    setVerificationError('')

    try {
      const response = await apiService.verifyEmail({
        email: userEmail,
        verificationCode: verificationCode
      })

      // Store tokens
      if (response.tokens) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('aura_access_token', response.tokens.accessToken)
          localStorage.setItem('aura_refresh_token', response.tokens.refreshToken)
          localStorage.setItem('aura_user', JSON.stringify(response.user))
          
          // Clear verification data from session
          sessionStorage.removeItem('verificationEmail')
          sessionStorage.removeItem('userName')
        }
      }

      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationError(error.message || 'Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!userEmail) return
    
    setResendError('')
    
    try {
      await apiService.resendVerificationCode(userEmail)
      setTimeLeft(60)
      setCanResend(false)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (error) {
      console.error('Resend error:', error)
      setResendError(error.message || 'Failed to resend verification code')
    }
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

  const codeInputVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
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

        {/* Verification Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card-enhanced border-cyan-500/20">
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white">Verify Your Account</CardTitle>
              <p className="text-slate-400">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-cyan-300 font-medium">{userEmail || 'your email'}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code Input */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <label className="block text-sm font-medium text-slate-300 text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center space-x-3">
                    {code.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(ref) => inputRefs.current[index] = ref}
                        variants={codeInputVariants}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold bg-white/5 border-2 border-cyan-500/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-300/50 transition-all duration-300"
                        placeholder="•"
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Error Display */}
                {verificationError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center"
                  >
                    <p className="text-red-400 text-sm">{verificationError}</p>
                  </motion.div>
                )}

                {/* Timer */}
                <motion.div variants={itemVariants} className="text-center space-y-3">
                  {resendError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-red-400 text-sm">{resendError}</p>
                    </div>
                  )}
                  
                  {!canResend ? (
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>Resend code in {timeLeft}s</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Resend verification code
                    </button>
                  )}
                </motion.div>

                {/* Verify Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25"
                    disabled={isLoading || code.join('').length !== 6}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Verify Account
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Help Text */}
              <motion.div variants={itemVariants} className="text-center space-y-3">
                <p className="text-sm text-slate-400">
                  Didn't receive the code? Check your spam folder.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span>•</span>
                  <span>Code expires in 10 minutes</span>
                  <span>•</span>
                </div>
              </motion.div>

              {/* Alternative Options */}
              <motion.div variants={itemVariants} className="border-t border-slate-700 pt-6">
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-400">Having trouble?</p>
                  <div className="flex justify-center gap-4">
                    <Link
                      href="/auth/login"
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Try different method
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
          </Card>
        </motion.div>

        {/* Security Badge */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-300 font-medium">Secure Verification Process</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}