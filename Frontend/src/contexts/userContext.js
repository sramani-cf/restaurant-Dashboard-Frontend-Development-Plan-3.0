'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import authClient from '@/lib/authClient'

const UserContext = createContext({
  user: null,
  loading: true,
  error: null,
  restaurantId: null,
  restaurants: [],
  currentRestaurant: null,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
  switchRestaurant: () => {}
})

export const logUserProviderData = (data) => {
  console.log('🔍 [UserProvider] Context Value:', data);
};

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider({ children }) {
  console.log('🔍 UserProvider: Rendering with initial state')
  
  // This will log both on server and client
  if (typeof window === 'undefined') {
    console.log('🔍 UserProvider: SERVER-SIDE RENDER')
  } else {
    console.log('🔍 UserProvider: CLIENT-SIDE RENDER')
  }
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [currentRestaurant, setCurrentRestaurant] = useState(null)

  // Get current restaurant ID
  const restaurantId = currentRestaurant?.id || "0cf289bb-0572-4620-8c9c-31adcd6bad69"
  
  console.log('🔍 UserProvider: Current state:', {
    user: user?.id || null,
    loading,
    error,
    restaurantsCount: restaurants.length,
    currentRestaurant: currentRestaurant?.name || null,
    restaurantId
  })

  // Initialize user data on mount
  useEffect(() => {
    console.log('🔍 UserProvider: useEffect triggered - calling initializeUser')
    console.log('🔍 UserProvider: About to call initializeUser function')
    try {
      initializeUser()
      console.log('🔍 UserProvider: initializeUser called successfully')
    } catch (error) {
      console.error('🔍 UserProvider: Error calling initializeUser:', error)
    }
  }, [])

  const initializeUser = async () => {
    console.log('🔍 initializeUser: Starting function')
    try {
      console.log('🔍 initializeUser: Setting loading to true')
      setLoading(true)
      setError(null)

      const accessToken = authClient.getAccessToken()
      console.log('🔍 initializeUser: Access token:', accessToken ? 'present' : 'missing')
      
      // Only proceed if we have a real authentication token
      if (!accessToken) {
        console.log('🔍 initializeUser: No access token - user not authenticated')
        setLoading(false)
        return
      }

      // Get user profile with restaurant data using real token
      console.log('🔍 initializeUser: Making API call with authenticated token')
      
      const response = await apiService.getUserProfile(accessToken)
      console.log("🔍 initializeUser: API response => ", response);
      const userData = response.user
      console.log("🔍 initializeUser: User data => ", userData);

      if (userData) {
        console.log('🔍 initializeUser: Setting user data')
        setUser(userData)
        
        // Extract restaurants from user's staff memberships
        console.log('🔍 initializeUser: Raw restaurant staff data:', userData.restaurantStaff)
        const userRestaurants = userData.restaurantStaff
          ?.filter(staff => {
            console.log('🔍 initializeUser: Processing staff:', staff, 'isActive:', staff.isActive)
            return staff.isActive
          })
          ?.map(staff => {
            const restaurant = {
              id: staff.restaurantId,
              name: staff.restaurant.name,
              slug: staff.restaurant.slug,
              role: staff.role,
              position: staff.position
            }
            console.log('🔍 initializeUser: Mapped restaurant:', restaurant)
            return restaurant
          }) || []
        
        console.log('🔍 initializeUser: Final extracted restaurants:', userRestaurants)
        setRestaurants(userRestaurants)

        // Set current restaurant (first active restaurant or from storage)
        const savedRestaurantId = localStorage.getItem('aura_current_restaurant_id')
        console.log('🔍 initializeUser: Saved restaurant ID from localStorage:', savedRestaurantId)
        let selectedRestaurant = null


        if (savedRestaurantId) {
          selectedRestaurant = userRestaurants.find(r => r.id === savedRestaurantId)
          console.log('🔍 initializeUser: Found saved restaurant:', selectedRestaurant)
        }
        
        if (!selectedRestaurant && userRestaurants.length > 0) {
          selectedRestaurant = userRestaurants[0]
          console.log('🔍 initializeUser: Using first restaurant as default:', selectedRestaurant)
        }

        console.log('🔍 initializeUser: Final selected restaurant:', selectedRestaurant)
        if (selectedRestaurant) {
          console.log('🔍 initializeUser: Setting current restaurant and saving to localStorage')
          setCurrentRestaurant(selectedRestaurant)
          localStorage.setItem('aura_current_restaurant_id', selectedRestaurant.id)
        }

        // Store user data in authClient for backward compatibility
        authClient.setCurrentUser(userData)
        console.log('🔍 initializeUser: User initialization completed successfully')
      } else {
        console.log('🔍 initializeUser: No user data received from API')
      }
    } catch (err) {
      console.error('🔍 initializeUser: ERROR occurred:', err)
      console.error('🔍 initializeUser: Error details:', {
        message: err.message,
        status: err.status,
        stack: err.stack
      })
      setError(err.message || 'Failed to load user data')
      
      // Clear invalid token
      if (err.status === 401) {
        console.log('🔍 initializeUser: 401 error - clearing tokens')
        authClient.logout()
      }
    } finally {
      console.log('🔍 initializeUser: Setting loading to false in finally block')
      setLoading(false)
    }
  }

  

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.login(credentials)
      
      if (response.tokens && response.user) {
        // Store tokens
        authClient.setCurrentUser(response.user)
        localStorage.setItem('aura_access_token', response.tokens.accessToken)
        localStorage.setItem('aura_refresh_token', response.tokens.refreshToken)

        // Initialize user data
        await initializeUser()
        
        return response
      }
    } catch (err) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

// let restaurantId1 = null;
// try {
//   let fakdata = localStorage.getItem('aura_user');
//   if (fakdata) {
//     fakdata = JSON.parse(fakdata);
//     // Check if fakdata is an array
//     if (Array.isArray(fakdata)) {
//       fakdata.forEach(r => {
//         restaurantId1 = r.id; // Will be overwritten if multiple items
//       });
//     } else if (typeof fakdata === 'object' && fakdata !== null) {
//       // If it's a single object instead of an array
//       restaurantId1 = fakdata.id;
//     }
//   }
//   console.log('restaurantId =>', restaurantId1);
// } catch (error) {
//   console.error('Failed to parse aura_user from localStorage:', error);
// }

//   useContext({

//   })

  const logout = async () => {
    try {
      const refreshToken = authClient.getRefreshToken()
      if (refreshToken) {
        await apiService.logout(refreshToken)
      }
    } catch (err) {
      console.error('Logout request failed:', err)
    } finally {
      // Clear all data regardless of API call success
      authClient.logout()
      localStorage.removeItem('aura_current_restaurant_id')
      setUser(null)
      setRestaurants([])
      setCurrentRestaurant(null)
      setError(null)
    }
  }

  const refreshUser = async () => {
    await initializeUser()
  }

  const switchRestaurant = (restaurantId) => {
    console.log('🔍 switchRestaurant: Called with ID:', restaurantId)
    console.log('🔍 switchRestaurant: Available restaurants:', restaurants)
    const restaurant = restaurants.find(r => r.id === restaurantId || 'restaurant_001')
    console.log("🔍 switchRestaurant: Found restaurant => ", restaurant);
    if (restaurant) {
      console.log('🔍 switchRestaurant: Setting restaurant and saving to localStorage')
      setCurrentRestaurant(restaurant)
      localStorage.setItem('aura_current_restaurant_id', restaurant.id)
    } else {
      console.log('🔍 switchRestaurant: Restaurant not found!')
    }
  }

  const value = {
    user,
    loading,
    error,
    restaurantId,
    restaurants,
    currentRestaurant,
    login,
    logout,
    refreshUser,
    switchRestaurant
  }
  
  console.log('🔍 UserProvider: Providing context value:', {
    hasUser: !!user,
    loading,
    error,
    restaurantId,
    restaurantsCount: restaurants.length,
    currentRestaurantName: currentRestaurant?.name,
    hasLogin: typeof login === 'function',
    hasLogout: typeof logout === 'function'
  })

  logUserProviderData({
  hasUser: !!user,
  loading,
  error,
  restaurantId,
  restaurantsCount: restaurants?.length,
  currentRestaurantName: currentRestaurant?.name,
  hasLogin: typeof login === 'function',
  hasLogout: typeof logout === 'function',
});


  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContext