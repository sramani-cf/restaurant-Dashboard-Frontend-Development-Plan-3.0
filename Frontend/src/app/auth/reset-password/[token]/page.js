'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService } from '@/services/api'
import {
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Lock
} from 'lucide-react'

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })

  useEffect(() => {
    // Validate password strength
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password)
    })
  }, [password])

  const isPasswordValid = Object.values(passwordStrength).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isPasswordValid) {
      setError('Password does not meet strength requirements')
      return
    }
    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await apiService.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      console.error('Password reset error:', error)
      setError(error.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setIsLoading(false)
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

  // Success view
  if (success) {
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
            <Card className="glass-card-enhanced border-cyan-500/20">
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
                  <CardTitle className="text-2xl font-bold text-white">Password Reset Complete</CardTitle>
                  <p className="text-slate-400">
                    Your password has been successfully updated. You will be redirected to the login page in a few seconds.
                  </p>
                </div>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <Link href="/auth/login">
                  <Button className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25">
                    Continue to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    )
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
            <CardHeader className="space-y-4 text-center pb-6">
              {/* Key Icon */}
              <div className="mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 flex items-center justify-center">
                  <KeyRound className="h-10 w-10 text-orange-300" />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-white">Create New Password</CardTitle>
                <p className="text-slate-400">
                  Enter your new password below. Make sure it's strong and secure.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-cyan-500/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-300/50 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Password Strength Indicators */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-medium text-slate-300">Password Requirements:</p>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className={`flex items-center gap-2 ${passwordStrength.minLength ? 'text-green-400' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${passwordStrength.minLength ? 'bg-green-400' : 'bg-slate-600'}`} />
                        At least 8 characters
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasUppercase ? 'text-green-400' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${passwordStrength.hasUppercase ? 'bg-green-400' : 'bg-slate-600'}`} />
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasLowercase ? 'text-green-400' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${passwordStrength.hasLowercase ? 'bg-green-400' : 'bg-slate-600'}`} />
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${passwordStrength.hasNumber ? 'bg-green-400' : 'bg-slate-600'}`} />
                        One number
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasSpecial ? 'text-green-400' : 'text-slate-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${passwordStrength.hasSpecial ? 'bg-green-400' : 'bg-slate-600'}`} />
                        One special character
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-300/50 transition-all duration-300 ${
                        confirmPassword && !passwordsMatch ? 'border-red-500/50' : 'border-cyan-500/20'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-red-400 text-xs">Passwords do not match</p>
                  )}
                </motion.div>

                {/* Error Display */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Reset Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/25"
                    disabled={isLoading || !isPasswordValid || !passwordsMatch}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Update Password
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
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