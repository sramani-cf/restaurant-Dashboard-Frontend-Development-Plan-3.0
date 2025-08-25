import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden group",
  {
    variants: {
      variant: {
        // Neural Quantum Primary - Main CTA buttons
        default: "bg-gradient-to-r from-cyan-500 to-blue-600 text-black  hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/30 hover:border-cyan-300/50",
        
        // Destructive Neural - Warning/Delete actions
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-400 hover:to-red-500 border border-red-400/30 hover:border-red-300/50",
        
        // Holographic Outline - Secondary actions
        outline: "border-2 border-cyan-400/40 bg-transparent text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-300/60 hover:text-cyan-200 shadow-inner backdrop-blur-sm",
        
        // Neural Secondary - Supporting actions
        secondary: "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-200 border border-purple-500/30 hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-400/50 backdrop-blur-sm",
        
        // Quantum Ghost - Subtle interactions
        ghost: "text-slate-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-purple-500/10 hover:text-cyan-300 hover:backdrop-blur-sm",
        
        // Neural Link - Navigation/links
        link: "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300 transition-colors",
        
        // Glass Morphism - Modern floating actions
        glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/20 shadow-2xl",
        
        // Neon Glow - Attention-grabbing actions
        neon: "bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold hover:from-cyan-300 hover:to-purple-400 shadow-lg shadow-cyan-400/30 hover:shadow-xl hover:shadow-purple-400/40 border border-cyan-300/50",
        
        // Hologram - Futuristic interactive elements
        hologram: "bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent border-2 border-cyan-400/30 text-cyan-300 hover:from-cyan-400/10 hover:via-cyan-400/30 hover:to-purple-400/10 hover:border-cyan-300/50 backdrop-blur-md",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 text-xs rounded-lg",
        lg: "h-13 px-8 py-3 text-base rounded-2xl",
        icon: "h-11 w-11 rounded-xl",
        xl: "h-16 px-12 py-4 text-lg rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  children,
  disabled,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : motion.button
  const [isPressed, setIsPressed] = React.useState(false)
  
  const motionProps = asChild ? {} : {
    whileHover: { 
      scale: disabled ? 1 : 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    whileTap: { 
      scale: disabled ? 1 : 0.98,
      transition: { duration: 0.1 }
    },
    initial: { scale: 1 },
    onTapStart: () => setIsPressed(true),
    onTap: () => setIsPressed(false),
    onTapCancel: () => setIsPressed(false),
  }
  
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      disabled={disabled}
      {...motionProps}
      {...props}
    >
      {/* Neural Glow Background Effect */}
      {!asChild && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 opacity-0 group-hover:opacity-100"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Quantum Ripple Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
            animate={isPressed ? {
              scale: [1, 1.5],
              opacity: [0, 0.3, 0],
            } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Holographic Shimmer */}
          {(variant === 'hologram' || variant === 'glass') && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Neural Connection Lines */}
          {variant === 'neon' && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-30" />
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-400 to-transparent opacity-30" />
            </div>
          )}
        </>
      )}
      
      {/* Content Wrapper with Z-index */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      
    </Comp>
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }