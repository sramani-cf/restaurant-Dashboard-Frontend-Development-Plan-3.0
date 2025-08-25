'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewReservationModal } from '@/components/reservations/new-reservation-modal'
import { TABLE_STATUSES, RESERVATION_DATA } from '@/constants/demo-data'
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Plus,
  MapPin,
  Filter
} from 'lucide-react'

export default function ReservationsPage() {
  const [selectedTable, setSelectedTable] = useState(null)
  const [viewMode, setViewMode] = useState('floor-plan') // 'floor-plan' or 'list'
  const [showNewReservationModal, setShowNewReservationModal] = useState(false)
  const [reservations, setReservations] = useState(RESERVATION_DATA)

  const getTableColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 border-green-500/50 hover:border-green-500'
      case 'occupied':
        return 'bg-red-500/20 border-red-500/50 hover:border-red-500'
      case 'reserved':
        return 'bg-blue-500/20 border-blue-500/50 hover:border-blue-500'
      case 'cleaning':
        return 'bg-yellow-500/20 border-yellow-500/50 hover:border-yellow-500'
      default:
        return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleNewReservation = (newReservation) => {
    setReservations(prev => [...prev, newReservation])
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reservations & Seating</h1>
            <p className="text-muted-foreground">
              Manage table reservations and floor plan
            </p>
          </div>
          <div className="flex gap-3">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Users className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">18</p>
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
                  <p className="text-2xl font-bold">12</p>
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
                  <p className="text-2xl font-bold">25</p>
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
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-muted-foreground">Occupancy</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    {TABLE_STATUSES.map((table) => (
                      <div
                        key={table.id}
                        className={`absolute w-20 h-20 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${getTableColor(table.status)} ${
                          selectedTable === table.id ? 'scale-110 ring-2 ring-primary' : 'hover:scale-105'
                        }`}
                        style={{
                          left: `${table.x}px`,
                          top: `${table.y}px`,
                        }}
                        onClick={() => setSelectedTable(selectedTable === table.id ? null : table.id)}
                      >
                        <span className="font-bold text-lg">{table.number}</span>
                        <span className="text-xs">{table.seats} seats</span>
                      </div>
                    ))}

                    {/* Bar Area */}
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-16 h-32 bg-amber-600/30 rounded-lg border border-amber-500/30 flex items-center justify-center">
                      <span className="text-sm font-medium transform -rotate-90">Bar</span>
                    </div>
                  </div>

                  {/* Selected Table Info */}
                  {selectedTable && (
                    <div className="mt-4 p-4 rounded-lg border border-white/10 bg-white/5">
                      {(() => {
                        const table = TABLE_STATUSES.find(t => t.id === selectedTable)
                        return (
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">Table {table.number}</h3>
                              <p className="text-sm text-muted-foreground">
                                {table.seats} seats • Status: {getStatusText(table.status)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Assign Guest
                              </Button>
                              <Button size="sm" variant="outline">
                                Mark Clean
                              </Button>
                              <Button size="sm">
                                View Details
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
                    <CardTitle>All Tables</CardTitle>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {TABLE_STATUSES.map((table) => (
                      <div key={table.id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Table {table.number}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            table.status === 'available' ? 'bg-green-500/20 text-green-400' :
                            table.status === 'occupied' ? 'bg-red-500/20 text-red-400' :
                            table.status === 'reserved' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {getStatusText(table.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{table.seats} seats</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Details
                          </Button>
                          <Button size="sm" className="flex-1">
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reservations Sidebar */}
          <div className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Today's Reservations</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="p-3 rounded-lg border border-white/10 bg-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{reservation.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {reservation.guests} guests
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          reservation.status === 'confirmed' 
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {reservation.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reservation.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Table {reservation.table}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" className="flex-1">
                          Seat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Waitlist</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">Williams Party</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          3 guests • 15 min wait
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                        Waiting
                      </span>
                    </div>
                    <Button size="sm" className="w-full">
                      Seat Party
                    </Button>
                  </div>

                  <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">Chen Family</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          5 guests • 22 min wait
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                        Waiting
                      </span>
                    </div>
                    <Button size="sm" className="w-full">
                      Seat Party
                    </Button>
                  </div>
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