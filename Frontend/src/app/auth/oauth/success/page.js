'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { authClient } from '@/lib/authClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Zap,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'

export default function OAuthSuccessPage() {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Processing your authentication...')
  const searchParams = useSearchParams()

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get tokens from URL parameters
        const result = authClient.handleOAuthSuccess(searchParams)
        
        if (result.success) {
          setStatus('success')
          setMessage('Welcome to AURA 2030! Redirecting to dashboard...')
          
          // Fetch user info with the access token
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${result.tokens.accessToken}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const userData = await response.json()
              authClient.setCurrentUser(userData.user)
            }
          } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError)
            // Continue anyway, we have the tokens
          }
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Authentication failed. Please try again.')
          
          // Redirect to login after delay
          setTimeout(() => {
            window.location.href = '/auth/login'
          }, 3000)
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        
        // Redirect to login after delay
        setTimeout(() => {
          window.location.href = '/auth/login'
        }, 3000)
      }
    }

    processOAuthCallback()
  }, [searchParams])

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { delay: 0.2, type: "spring", stiffness: 200 }
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
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 mb-4">
            <Zap className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold holo-text mb-2">AURA 2030</h1>
          <p className="text-slate-400 text-sm font-mono">Neural Restaurant OS</p>
        </div>

        {/* Status Card */}
        <Card className="glass-card-enhanced border-cyan-500/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <motion.div
                variants={iconVariants}
                className={`p-4 rounded-full ${
                  status === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : status === 'error'
                    ? 'bg-red-500/20 border border-red-500/30'
                    : 'bg-blue-500/20 border border-blue-500/30'
                }`}
              >
                {status === 'processing' && (
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                )}
                {status === 'error' && (
                  <AlertCircle className="w-8 h-8 text-red-400" />
                )}
              </motion.div>
            </div>
            
            <CardTitle className={`text-2xl font-bold ${
              status === 'success' 
                ? 'text-green-300' 
                : status === 'error'
                ? 'text-red-300'
                : 'text-blue-300'
            }`}>
              {status === 'processing' && 'Processing...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Authentication Failed'}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-slate-300 text-lg leading-relaxed">
              {message}
            </p>
            
            {status === 'processing' && (
              <div className="mt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-300 font-medium">Redirecting to Dashboard</span>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-red-300 font-medium">Redirecting to Login</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}