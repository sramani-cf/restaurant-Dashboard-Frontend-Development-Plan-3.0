import React from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const PartySize = ({ value, onChange, maxSize = 12, className }) => {
  const partySize = value || 1

  const handleSizeChange = (newSize) => {
    if (newSize >= 1 && newSize <= maxSize) {
      onChange?.(newSize)
    }
  }

  const sizeOptions = Array.from({ length: maxSize }, (_, i) => i + 1)

  const getSizeDescription = (size) => {
    if (size === 1) return 'Solo dining'
    if (size === 2) return 'Couple'
    if (size <= 4) return 'Small group'
    if (size <= 6) return 'Family group'
    if (size <= 8) return 'Medium party'
    return 'Large party'
  }

  const getSizeIcon = (size) => {
    if (size <= 2) return '👥'
    if (size <= 4) return '👨‍👩‍👧‍👦'
    if (size <= 8) return '🎉'
    return '🎊'
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            Party Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counter Display */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <motion.div
                className="w-32 h-32 rounded-full border-4 border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 backdrop-blur-sm flex flex-col items-center justify-center"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.span
                  key={partySize}
                  className="text-4xl font-bold text-cyan-300"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {partySize}
                </motion.span>
                <span className="text-sm text-slate-400 mt-1">
                  {partySize === 1 ? 'guest' : 'guests'}
                </span>
              </motion.div>
              
              {/* Neural glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* Size Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSizeChange(partySize - 1)}
              disabled={partySize <= 1}
              className="w-12 h-12 rounded-xl"
            >
              <Minus className="h-5 w-5" />
            </Button>
            
            <motion.div
              className="px-6 py-3 rounded-xl bg-black/20 border border-white/10 min-w-[120px] text-center backdrop-blur-sm"
              key={partySize}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl mb-1">{getSizeIcon(partySize)}</div>
              <div className="text-sm text-cyan-300 font-medium">{getSizeDescription(partySize)}</div>
            </motion.div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSizeChange(partySize + 1)}
              disabled={partySize >= maxSize}
              className="w-12 h-12 rounded-xl"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Selection Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 text-center">Quick Select</h4>
            <div className="grid grid-cols-4 gap-2">
              {sizeOptions.slice(0, 8).map((size) => (
                <motion.button
                  key={size}
                  type="button"
                  className={cn(
                    "relative p-3 rounded-lg text-sm font-medium transition-all duration-200 border",
                    partySize === size
                      ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-200"
                      : "bg-black/20 border-white/10 text-white hover:border-cyan-400/30 hover:bg-cyan-400/10"
                  )}
                  onClick={() => handleSizeChange(size)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {size}
                  
                  {partySize === size && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-cyan-400/10 rounded-lg"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </>
                  )}
                </motion.button>
              ))}
            </div>
            
            {maxSize > 8 && (
              <div className="grid grid-cols-4 gap-2">
                {sizeOptions.slice(8).map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    className={cn(
                      "relative p-3 rounded-lg text-sm font-medium transition-all duration-200 border",
                      partySize === size
                        ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-200"
                        : "bg-black/20 border-white/10 text-white hover:border-cyan-400/30 hover:bg-cyan-400/10"
                    )}
                    onClick={() => handleSizeChange(size)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {size}
                    
                    {partySize === size && (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-cyan-400/10 rounded-lg"
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Size Information */}
          {partySize > 8 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/30"
            >
              <p className="text-sm text-purple-200 text-center">
                🎉 Large party reservation! We'll ensure you have the perfect space.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { PartySize }