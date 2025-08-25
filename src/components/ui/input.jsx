import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Input = React.forwardRef(({ className, type, error, label, placeholder, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(Boolean(props.value || props.defaultValue))

  React.useEffect(() => {
    setHasValue(Boolean(props.value))
  }, [props.value])

  const showFloatingLabel = focused || hasValue

  return (
    <div className="relative w-full">
      {label && (
        <motion.label
          className={cn(
            "absolute text-sm transition-all duration-200 pointer-events-none z-10 bg-slate-900 rounded px-1",
            showFloatingLabel
              ? "top-0 left-3 -translate-y-1/2 text-xs text-cyan-400 opacity-100"
              : "top-1/2 left-4 -translate-y-1/2 text-slate-400 bg-transparent opacity-0"
          )}
          animate={{
            scale: showFloatingLabel ? 0.9 : 1,
            opacity: showFloatingLabel ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      
      <motion.input
        type={type}
        placeholder={!showFloatingLabel ? placeholder || label : ''}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-white/10 bg-black/20 backdrop-blur-sm px-4 py-2 text-sm text-white transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500/50 focus-visible:border-red-400/50 focus-visible:ring-red-400/20",
          showFloatingLabel && "pt-4 pb-2",
          className
        )}
        ref={ref}
        onFocus={(e) => {
          setFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          setHasValue(Boolean(e.target.value))
          props.onBlur?.(e)
        }}
        onChange={(e) => {
          setHasValue(Boolean(e.target.value))
          props.onChange?.(e)
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
      
    </div>
  )
})
Input.displayName = "Input"

export { Input }