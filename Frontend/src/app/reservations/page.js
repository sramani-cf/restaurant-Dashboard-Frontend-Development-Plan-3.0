'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NewReservationModal } from '@/components/reservations/new-reservation-modal'
import reservationService from '@/services/reservationService'
import websocketService from '@/services/websocketService'
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Plus,
  MapPin,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react'

export default function ReservationsPage() {
  // State management
  const [selectedTable, setSelectedTable] = useState(null)
  const [viewMode, setViewMode] = useState('floor-plan')
  const [showNewReservationModal, setShowNewReservationModal] = useState(false)
  const [tables, setTables] = useState([])
  const [reservations, setReservations] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [analytics, setAnalytics] = useState({
    seatedTables: 0,
    totalReservations: 0,
    avgWaitTime: 0,
    occupancyRate: 0
  })
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Get restaurant ID (in production, this would come from user context or route params)
  const restaurantId = process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_ID || 'demo-restaurant-id'

  // Initialize data and WebSocket connection
  useEffect(() => {
    initializeData()
    connectWebSocket()

    return () => {
      websocketService.disconnect()
    }
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch initial data in parallel
      const [tablesData, reservationsData, waitlistData, analyticsData] = await Promise.all([
        reservationService.getTableStatus(restaurantId),
        reservationService.getReservations(restaurantId, { 
          date: new Date().toISOString().split('T')[0] 
        }),
        reservationService.getWaitlist(restaurantId),
        reservationService.getReservationAnalytics(restaurantId, {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        })
      ])

      setTables(tablesData.tables || [])
      setReservations(reservationsData.reservations || [])
      setWaitlist(waitlistData.waitlist || [])
      setAnalytics({
        seatedTables: analyticsData.seatedTables || 0,
        totalReservations: analyticsData.totalReservations || 0,
        avgWaitTime: analyticsData.avgWaitTime || 0,
        occupancyRate: analyticsData.occupancyRate || 0
      })

    } catch (err) {
      console.error('Error initializing data:', err)
      setError(err.message || 'Failed to load reservation data')
    } finally {
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    websocketService.connect(restaurantId)

    // Connection status handlers
    websocketService.on('connection_established', () => {
      setIsConnected(true)
      websocketService.joinRestaurant(restaurantId)
    })

    websocketService.on('connection_lost', () => {
      setIsConnected(false)
    })

    websocketService.on('connection_error', (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    })

    // Real-time event handlers
    websocketService.on('table_status_changed', handleTableStatusChange)
    websocketService.on('reservation_created', handleReservationCreated)
    websocketService.on('reservation_updated', handleReservationUpdated)
    websocketService.on('reservation_cancelled', handleReservationCancelled)
    websocketService.on('waitlist_updated', handleWaitlistUpdated)
  }

  // WebSocket event handlers
  const handleTableStatusChange = useCallback((data) => {
    setTables(prev => prev.map(table => 
      table.id === data.tableId 
        ? { ...table, status: data.status, lastUpdated: data.timestamp }
        : table
    ))
    setLastUpdate(new Date())
  }, [])

  const handleReservationCreated = useCallback((data) => {
    setReservations(prev => [...prev, data.reservation])
    updateAnalytics()
  }, [])

  const handleReservationUpdated = useCallback((data) => {
    setReservations(prev => prev.map(reservation =>
      reservation.id === data.reservation.id ? data.reservation : reservation
    ))
    updateAnalytics()
  }, [])

  const handleReservationCancelled = useCallback((data) => {
    setReservations(prev => prev.filter(reservation => reservation.id !== data.reservationId))
    updateAnalytics()
  }, [])

  const handleWaitlistUpdated = useCallback((data) => {
    setWaitlist(data.waitlist || [])
  }, [])

  const updateAnalytics = async () => {
    try {
      const analyticsData = await reservationService.getReservationAnalytics(restaurantId, {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      })
      
      setAnalytics({
        seatedTables: analyticsData.seatedTables || 0,
        totalReservations: analyticsData.totalReservations || 0,
        avgWaitTime: analyticsData.avgWaitTime || 0,
        occupancyRate: analyticsData.occupancyRate || 0
      })
    } catch (error) {
      console.error('Error updating analytics:', error)
    }
  }

  // Table management functions
  const handleTableClick = async (table) => {
    setSelectedTable(selectedTable === table.id ? null : table.id)
    
    if (selectedTable !== table.id) {
      websocketService.subscribeToTable(table.id)
    } else {
      websocketService.unsubscribeFromTable(table.id)
    }
  }

  const handleTableStatusUpdate = async (tableId, newStatus, notes = '') => {
    try {
      await reservationService.updateTableStatus(restaurantId, tableId, newStatus, notes)
      websocketService.markTableStatus(tableId, newStatus, notes)
    } catch (error) {
      console.error('Error updating table status:', error)
      setError('Failed to update table status')
    }
  }

  const handleAssignTable = async (reservationId, tableId) => {
    try {
      await reservationService.assignTable(reservationId, tableId)
    } catch (error) {
      console.error('Error assigning table:', error)
      setError('Failed to assign table')
    }
  }

  // Reservation management
  const handleNewReservation = async (reservationData) => {
    try {
      const newReservation = await reservationService.createReservation(restaurantId, reservationData)
      // WebSocket will handle the real-time update
      return newReservation
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  const handlePromoteFromWaitlist = async (waitlistId) => {
    try {
      await reservationService.promoteFromWaitlist(waitlistId)
    } catch (error) {
      console.error('Error promoting from waitlist:', error)
      setError('Failed to promote from waitlist')
    }
  }

  const handleRefreshData = async () => {
    await initializeData()
  }

  // Utility functions
  const getTableColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500/20 border-green-500/50 hover:border-green-500'
      case 'OCCUPIED':
        return 'bg-red-500/20 border-red-500/50 hover:border-red-500'
      case 'RESERVED':
        return 'bg-blue-500/20 border-blue-500/50 hover:border-blue-500'
      case 'CLEANING':
        return 'bg-yellow-500/20 border-yellow-500/50 hover:border-yellow-500'
      case 'OUT_OF_ORDER':
        return 'bg-gray-500/20 border-gray-500/50 hover:border-gray-500'
      default:
        return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  const getStatusText = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-3 w-3" />
      case 'ARRIVED':
        return <MapPin className="h-3 w-3" />
      case 'SEATED':
        return <Users className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  // Filter functions
  const filteredTables = tables.filter(table => {
    if (filterStatus === 'all') return true
    return table.status === filterStatus
  })

  const filteredReservations = reservations.filter(reservation => {
    if (!searchQuery) return true
    return reservation.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           reservation.phone?.includes(searchQuery)
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-400" />
            <p className="text-lg font-medium">Loading reservations...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reservations & Seating</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">
                Manage table reservations and floor plan
              </p>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <Wifi className="h-3 w-3" />
                    Live
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant={viewMode === 'floor-plan' ? 'default' : 'outline'}
              onClick={() => setViewMode('floor-plan')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Floor Plan
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              List View
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowNewReservationModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Users className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.seatedTables}</p>
                  <p className="text-sm text-muted-foreground">Seated Tables</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.totalReservations}</p>
                  <p className="text-sm text-muted-foreground">Reservations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Clock className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.avgWaitTime}</p>
                  <p className="text-sm text-muted-foreground">Avg Wait (min)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <MapPin className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics.occupancyRate}%</p>
                  <p className="text-sm text-muted-foreground">Occupancy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reservations by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
            <option value="CLEANING">Cleaning</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Floor Plan */}
          <div className="lg:col-span-3">
            {viewMode === 'floor-plan' ? (
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Interactive Floor Plan</CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500/50 border border-green-500"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500/50 border border-red-500"></div>
                        <span>Occupied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500/50 border border-blue-500"></div>
                        <span>Reserved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-500/50 border border-yellow-500"></div>
                        <span>Cleaning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-500/50 border border-gray-500"></div>
                        <span>Out of Order</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-slate-900/30 rounded-lg p-8 min-h-[400px] border border-white/10">
                    {/* Kitchen Area */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-600/30 px-4 py-2 rounded-lg border border-gray-500/30">
                      <span className="text-sm font-medium">Kitchen</span>
                    </div>

                    {/* Entrance */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600/30 px-4 py-2 rounded-lg border border-blue-500/30">
                      <span className="text-sm font-medium">Entrance</span>
                    </div>

                    {/* Tables */}
                    {filteredTables.map((table) => (
                      <div
                        key={table.id}
                        className={`absolute w-20 h-20 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${getTableColor(table.status)} ${
                          selectedTable === table.id ? 'scale-110 ring-2 ring-primary' : 'hover:scale-105'
                        } ${table.lastUpdated ? 'animate-pulse' : ''}`}
                        style={{
                          left: `${table.x || 50 + (table.number * 100) % 300}px`,
                          top: `${table.y || 100 + Math.floor(table.number / 4) * 80}px`,
                        }}
                        onClick={() => handleTableClick(table)}
                        title={`Table ${table.number} - ${getStatusText(table.status)} - ${table.seats} seats`}
                      >
                        <span className="font-bold text-lg">{table.number}</span>
                        <span className="text-xs">{table.seats} seats</span>
                        {table.lastUpdated && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping" />
                        )}
                      </div>
                    ))}

                    {/* Bar Area */}
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-16 h-32 bg-amber-600/30 rounded-lg border border-amber-500/30 flex items-center justify-center">
                      <span className="text-sm font-medium transform -rotate-90">Bar</span>
                    </div>

                    {/* Loading overlay for empty state */}
                    {tables.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No tables configured</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Table Info */}
                  {selectedTable && (
                    <div className="mt-4 p-4 rounded-lg border border-white/10 bg-white/5">
                      {(() => {
                        const table = tables.find(t => t.id === selectedTable)
                        if (!table) return null
                        
                        return (
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">Table {table.number}</h3>
                              <p className="text-sm text-muted-foreground">
                                {table.seats} seats • Status: {getStatusText(table.status)}
                              </p>
                              {table.section && (
                                <p className="text-xs text-muted-foreground">Section: {table.section}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleTableStatusUpdate(table.id, 'AVAILABLE')}
                                disabled={table.status === 'AVAILABLE'}
                              >
                                Mark Available
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleTableStatusUpdate(table.id, 'CLEANING')}
                                disabled={table.status === 'CLEANING'}
                              >
                                Mark Cleaning
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleTableStatusUpdate(table.id, 'OUT_OF_ORDER')}
                                disabled={table.status === 'OUT_OF_ORDER'}
                              >
                                Out of Order
                              </Button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>All Tables ({filteredTables.length})</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {filteredTables.filter(t => t.status === 'AVAILABLE').length} available
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTables.map((table) => (
                      <div 
                        key={table.id} 
                        className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Table {table.number}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            table.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                            table.status === 'OCCUPIED' ? 'bg-red-500/20 text-red-400' :
                            table.status === 'RESERVED' ? 'bg-blue-500/20 text-blue-400' :
                            table.status === 'CLEANING' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {getStatusText(table.status)}
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-muted-foreground">{table.seats} seats</p>
                          {table.section && (
                            <p className="text-xs text-muted-foreground">Section: {table.section}</p>
                          )}
                          {table.shape && (
                            <p className="text-xs text-muted-foreground">Shape: {table.shape}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setSelectedTable(table.id)}
                          >
                            Details
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            disabled={table.status !== 'AVAILABLE'}
                            onClick={() => handleTableStatusUpdate(table.id, 'OCCUPIED')}
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredTables.length === 0 && (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No tables match the current filter</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reservations Sidebar */}
          <div className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Today's Reservations ({filteredReservations.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredReservations.map((reservation) => (
                    <div key={reservation.id} className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{reservation.customerName || reservation.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {reservation.partySize || reservation.guests} guests
                          </p>
                          {reservation.phone && (
                            <p className="text-xs text-muted-foreground">{reservation.phone}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                            reservation.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                            reservation.status === 'ARRIVED' ? 'bg-green-500/20 text-green-400' :
                            reservation.status === 'SEATED' ? 'bg-purple-500/20 text-purple-400' :
                            reservation.status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {getStatusIcon(reservation.status)}
                            {getStatusText(reservation.status)}
                          </span>
                          {reservation.priority && reservation.priority > 0 && (
                            <span className="text-xs text-yellow-400">VIP</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(reservation.time || reservation.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {reservation.tableId && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Table {tables.find(t => t.id === reservation.tableId)?.number || 'TBD'}
                          </span>
                        )}
                      </div>
                      {reservation.specialRequests && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {reservation.specialRequests}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.open(`tel:${reservation.phone}`)}
                          disabled={!reservation.phone}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          disabled={reservation.status === 'SEATED' || reservation.status === 'COMPLETED'}
                          onClick={() => handleAssignTable(reservation.id, selectedTable)}
                        >
                          {reservation.status === 'CONFIRMED' ? 'Seat' : 
                           reservation.status === 'ARRIVED' ? 'Assign Table' : 'Complete'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredReservations.length === 0 && (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No reservations found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Waitlist ({waitlist.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {waitlist.map((waitItem) => (
                    <div key={waitItem.id} className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{waitItem.customerName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {waitItem.partySize} guests • {waitItem.estimatedWait} min wait
                          </p>
                          {waitItem.phone && (
                            <p className="text-xs text-muted-foreground">{waitItem.phone}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                            Position {waitItem.position || waitlist.indexOf(waitItem) + 1}
                          </span>
                          {waitItem.priority > 0 && (
                            <span className="text-xs text-yellow-400">Priority</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handlePromoteFromWaitlist(waitItem.id)}
                        >
                          Promote
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(`tel:${waitItem.phone}`)}
                          disabled={!waitItem.phone}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Notify
                        </Button>
                      </div>
                    </div>
                  ))}
                  {waitlist.length === 0 && (
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No one waiting</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={showNewReservationModal}
        onClose={() => setShowNewReservationModal(false)}
        onSuccess={handleNewReservation}
      />
    </DashboardLayout>
  )
}