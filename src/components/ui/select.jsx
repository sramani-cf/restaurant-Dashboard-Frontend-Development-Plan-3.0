import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const Select = React.forwardRef(({ 
  className, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option...",
  label,
  error,
  disabled,
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || '')
  const selectRef = React.useRef(null)

  const selectedOption = options.find(option => option.value === selectedValue)

  React.useEffect(() => {
    setSelectedValue(value || '')
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    setSelectedValue(option.value)
    onChange?.(option.value, option)
    setIsOpen(false)
  }

  const hasValue = selectedValue !== ''
  const showFloatingLabel = isOpen || hasValue

  return (
    <div className="relative w-full" ref={selectRef}>
      {label && (
        <motion.label
          className={cn(
            "absolute text-sm transition-all duration-200 pointer-events-none z-20 bg-slate-900 rounded px-1",
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

      <motion.button
        type="button"
        ref={ref}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border-2 border-white/10 bg-black/20 backdrop-blur-sm px-4 py-2 text-sm text-white transition-all duration-200 focus-visible:outline-none focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500/50 focus-visible:border-red-400/50 focus-visible:ring-red-400/20",
          isOpen && "border-cyan-400/50 ring-2 ring-cyan-400/20",
          showFloatingLabel && "pt-4 pb-2",
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        <span className={cn(
          "truncate",
          !hasValue && "text-slate-500"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.div>
      </motion.button>

      {/* Neural glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 opacity-0 pointer-events-none"
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 z-50 w-full mt-2 rounded-xl border-2 border-white/10 bg-black/90 backdrop-blur-md shadow-2xl shadow-black/50"
          >
            <div className="max-h-60 overflow-auto p-2">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-cyan-400/10 hover:text-cyan-300",
                    selectedValue === option.value && "bg-cyan-400/20 text-cyan-300"
                  )}
                  onClick={() => handleSelect(option)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 2 }}
                >
                  <span className="truncate">{option.label}</span>
                  {selectedValue === option.value && (
                    <Check className="h-4 w-4 text-cyan-400 ml-2 flex-shrink-0" />
                  )}
                </motion.button>
              ))}
              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-slate-500">No options available</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {isOpen && (
        <>
          <motion.div
            className="absolute top-1 right-1 w-1 h-1 bg-cyan-400 rounded-full z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ delay: 0.1 }}
          />
          <motion.div
            className="absolute bottom-1 left-1 w-1 h-1 bg-purple-400 rounded-full z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ delay: 0.2 }}
          />
        </>
      )}
    </div>
  )
})
Select.displayName = "Select"

export { Select }