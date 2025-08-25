import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Textarea = React.forwardRef(({ className, error, label, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(props.value || props.defaultValue || false)

  React.useEffect(() => {
    setHasValue(props.value || false)
  }, [props.value])

  return (
    <div className="relative w-full">
      {label && (
        <motion.label
          className={cn(
            "absolute text-sm transition-all duration-200 pointer-events-none z-10",
            focused || hasValue
              ? "top-0 left-3 -translate-y-1/2 text-xs bg-slate-900 px-2 text-cyan-400"
              : "top-6 left-4 -translate-y-1/2 text-slate-400"
          )}
          animate={{
            scale: focused || hasValue ? 0.9 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      
      <motion.textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border-2 border-white/10 bg-black/20 backdrop-blur-sm px-4 py-3 text-sm text-white transition-all duration-200 placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          error && "border-red-500/50 focus-visible:border-red-400/50 focus-visible:ring-red-400/20",
          label && (focused || hasValue) && "pt-6",
          className
        )}
        ref={ref}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          setHasValue(e.target.value !== '')
          props.onBlur?.(e)
        }}
        whileFocus={{ scale: 1.01 }}
        {...props}
      />
      
      {/* Neural glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 opacity-0 pointer-events-none"
        animate={{ opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1 ml-1"
        >
          {error}
        </motion.p>
      )}
      
      {/* Corner indicators */}
      {focused && (
        <>
          <motion.div
            className="absolute top-1 right-1 w-1 h-1 bg-cyan-400 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ delay: 0.1 }}
          />
          <motion.div
            className="absolute bottom-1 left-1 w-1 h-1 bg-purple-400 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ delay: 0.2 }}
          />
        </>
      )}
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea }