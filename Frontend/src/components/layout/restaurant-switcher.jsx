'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/contexts/userContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Building, 
  Check, 
  ChevronDown,
  Crown,
  Users,
  MapPin,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function RestaurantSwitcher() {
  const { 
    currentRestaurant, 
    restaurants, 
    switchRestaurant, 
    loading 
  } = useUser()
  
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading || !restaurants || restaurants.length === 0) {
    return null
  }

  // Don't show switcher if user only has access to one restaurant
  if (restaurants.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
        <Building className="h-4 w-4 text-cyan-400" />
        <span className="text-sm font-medium">{currentRestaurant?.name}</span>
        {currentRestaurant?.role === 'MANAGER' && (
          <Crown className="h-3 w-3 text-yellow-400" />
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10"
      >
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-cyan-400" />
          <span className="font-medium truncate">
            {currentRestaurant?.name || 'Select restaurant...'}
          </span>
          {currentRestaurant?.role === 'MANAGER' && (
            <Crown className="h-3 w-3 text-yellow-400" />
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 opacity-50 transition-transform",
          open && "rotate-180"
        )} />
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-slate-900/95 border border-white/10 rounded-lg shadow-lg backdrop-blur-sm">
          <Card className="border-0 bg-transparent">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <h4 className="font-semibold text-sm">Select Restaurant</h4>
                <span className="text-xs text-muted-foreground">
                  {restaurants.length} available
                </span>
              </div>
              <div className="space-y-1 p-2 max-h-[300px] overflow-y-auto">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm transition-colors",
                      currentRestaurant?.id === restaurant.id
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "hover:bg-white/5"
                    )}
                    onClick={() => {
                      switchRestaurant(restaurant.id)
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Building className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{restaurant.name}</span>
                          {restaurant.role === 'MANAGER' && (
                            <Crown className="h-3 w-3 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="capitalize">{restaurant.role?.toLowerCase()}</span>
                          </div>
                          {restaurant.position && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{restaurant.position}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {currentRestaurant?.id === restaurant.id && (
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  <span>Data updates when switching restaurants</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default RestaurantSwitcher