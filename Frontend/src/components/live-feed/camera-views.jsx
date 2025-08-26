'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Camera, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Maximize,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useState } from 'react'
import { CAMERA_FEEDS } from '@/constants/demo-data'

export function CameraViews({ className = "" }) {
  const [selectedCamera, setSelectedCamera] = useState(CAMERA_FEEDS[0]?.id || null)
  const [isPlaying, setIsPlaying] = useState(true)

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'offline': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return Wifi
      case 'maintenance': return Settings
      case 'offline': return WifiOff
      default: return WifiOff
    }
  }

  const selectedCameraData = CAMERA_FEEDS.find(cam => cam.id === selectedCamera)

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="h-5 w-5 text-indigo-400" />
          Live Camera Feeds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Camera Display */}
        <div className="relative">
          <div className="aspect-video bg-black/50 rounded-lg border border-white/10 overflow-hidden">
            {selectedCameraData ? (
              <div className="relative h-full flex items-center justify-center">
                {/* Simulated Camera Feed */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center"
                >
                  <div className="text-center">
                    <Camera className="h-16 w-16 mx-auto mb-4 text-white/30" />
                    <p className="text-white/60 mb-2">{selectedCameraData.name}</p>
                    <p className="text-white/40 text-sm">{selectedCameraData.description}</p>
                    {selectedCameraData.status === 'maintenance' && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-yellow-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Under Maintenance</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Status Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className={getStatusColor(selectedCameraData.status)}>
                    {React.createElement(getStatusIcon(selectedCameraData.status), { className: "h-3 w-3 mr-1" })}
                    {selectedCameraData.status.toUpperCase()}
                  </Badge>
                  <Badge className="bg-black/50 text-white border-white/20">
                    LIVE
                  </Badge>
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="glass border-white/20 hover:bg-white/10"
                    disabled={selectedCameraData.status !== 'active'}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass border-white/20 hover:bg-white/10"
                    disabled={selectedCameraData.status !== 'active'}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass border-white/20 hover:bg-white/10"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>

                {/* Recording Indicator */}
                {isPlaying && selectedCameraData.status === 'active' && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-4 right-4 flex items-center gap-2 text-red-400"
                  >
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <span className="text-xs font-medium">REC</span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/30">
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4" />
                  <p>No camera selected</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Camera Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAMERA_FEEDS.map((camera, index) => {
            const StatusIcon = getStatusIcon(camera.status)
            const isSelected = selectedCamera === camera.id
            
            return (
              <motion.div
                key={camera.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-cyan-500/50' 
                    : 'hover:scale-105'
                }`}
                onClick={() => setSelectedCamera(camera.id)}
              >
                <Card className={`glass-card border-white/10 ${
                  isSelected ? 'border-cyan-500/30 bg-cyan-500/5' : 'hover:border-white/20'
                }`}>
                  <CardContent className="p-3">
                    {/* Camera Preview */}
                    <div className="aspect-video bg-black/30 rounded border border-white/10 mb-2 relative overflow-hidden">
                      <div className="h-full flex items-center justify-center">
                        <Camera className="h-8 w-8 text-white/30" />
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className={`${getStatusColor(camera.status)} text-xs`}>
                          <StatusIcon className="h-2 w-2 mr-1" />
                          {camera.status}
                        </Badge>
                      </div>

                      {/* Live indicator for active cameras */}
                      {camera.status === 'active' && (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute top-2 right-2 flex items-center gap-1 text-red-400"
                        >
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          <span className="text-xs font-medium">LIVE</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Camera Info */}
                    <div>
                      <h4 className="font-medium text-sm text-white/90 truncate mb-1">
                        {camera.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {camera.location}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Camera Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {CAMERA_FEEDS.filter(cam => cam.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">
              {CAMERA_FEEDS.filter(cam => cam.status === 'maintenance').length}
            </div>
            <div className="text-xs text-muted-foreground">Maintenance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {CAMERA_FEEDS.filter(cam => cam.status === 'offline').length}
            </div>
            <div className="text-xs text-muted-foreground">Offline</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}