import React, { useState, useEffect } from 'react'
import { AlertCircle, TrendingUp, Calendar, Gauge } from 'lucide-react'

const AstroidPlayer = () => {
  const [asteroidData, setAsteroidData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAsteroid, setSelectedAsteroid] = useState(null)
  const [dateRange, setDateRange] = useState({
    start: '2025-09-01',
    end: '2025-09-07'
  })

  useEffect(() => {
    fetchAsteroidData()
  }, [])

  const fetchAsteroidData = async () => {
    const API_BASE = 'http://localhost:3000'
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}?start_date=${dateRange.start}&end_date=${dateRange.end}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      setAsteroidData(data)
      if (data.asteroids && data.asteroids.length > 0) {
        setSelectedAsteroid(data.asteroids[0])
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getThreatLevel = (asteroid) => {
    if (!asteroid) return 'unknown'
    if (asteroid.is_potentially_hazardous_asteroid) return 'high'
    if (asteroid.close_approach_data?.[0]?.miss_distance?.kilometers < 1000000) return 'medium'
    return 'low'
  }

  const getThreatColor = (level) => {
    switch(level) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const formatNumber = (num) => {
    if (!num) return 'N/A'
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className='w-full min-h-screen bg-slate-950 p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>
            Astro <span className='font-light text-blue-400'>Meteoroid Detection</span>
          </h1>
          <p className='text-slate-400'>Real-time Near-Earth Object monitoring system</p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center h-96'>
            <div className='text-white text-xl'>Loading asteroid data...</div>
          </div>
        ) : error ? (
          <div className='bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-400'>
            <AlertCircle className='inline mr-2' />
            Error: {error}
          </div>
        ) : (
          <>
            {/* Statistics Bar */}
            <div className='grid grid-cols-4 gap-4 mb-8'>
              <div className='bg-slate-900 rounded-lg p-4 border border-slate-800'>
                <div className='text-slate-400 text-sm mb-1'>Total Detected</div>
                <div className='text-3xl font-bold text-white'>{asteroidData?.element_count || 0}</div>
              </div>
              <div className='bg-slate-900 rounded-lg p-4 border border-slate-800'>
                <div className='text-slate-400 text-sm mb-1'>Hazardous</div>
                <div className='text-3xl font-bold text-red-500'>
                  {asteroidData?.asteroids?.filter(a => a.is_potentially_hazardous_asteroid).length || 0}
                </div>
              </div>
              <div className='bg-slate-900 rounded-lg p-4 border border-slate-800'>
                <div className='text-slate-400 text-sm mb-1'>Avg Diameter</div>
                <div className='text-3xl font-bold text-blue-400'>
                  {formatNumber(asteroidData?.statistics?.averageDiameter)} m
                </div>
              </div>
              <div className='bg-slate-900 rounded-lg p-4 border border-slate-800'>
                <div className='text-slate-400 text-sm mb-1'>Avg Velocity</div>
                <div className='text-3xl font-bold text-purple-400'>
                  {formatNumber(asteroidData?.statistics?.averageVelocity)} km/h
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className='flex gap-6 h-[600px]'>
              {/* Left Panel - Asteroid List */}
              <div className='w-2/5 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex flex-col'>
                <div className='p-4 border-b border-slate-800'>
                  <h2 className='text-xl font-semibold text-white'>Detected Objects</h2>
                  <p className='text-sm text-slate-400 mt-1'>
                    {asteroidData?.asteroids?.length || 0} asteroids in range
                  </p>
                </div>
                <div className='overflow-y-auto flex-1'>
                  {asteroidData?.asteroids?.map((asteroid, idx) => {
                    const threatLevel = getThreatLevel(asteroid)
                    const isSelected = selectedAsteroid?.id === asteroid.id
                    return (
                      <div
                        key={asteroid.id || idx}
                        onClick={() => setSelectedAsteroid(asteroid)}
                        className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div className='flex-1'>
                            <div className='font-medium text-white mb-1'>{asteroid.name}</div>
                            <div className='text-xs text-slate-400'>ID: {asteroid.neo_reference_id}</div>
                          </div>
                          <div className={`text-xs font-semibold px-2 py-1 rounded ${getThreatColor(threatLevel)} bg-slate-800`}>
                            {threatLevel.toUpperCase()}
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-2 text-xs text-slate-400'>
                          <div>
                            <TrendingUp className='inline w-3 h-3 mr-1' />
                            {formatNumber(asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour)} km/h
                          </div>
                          <div>
                            <Gauge className='inline w-3 h-3 mr-1' />
                            {formatNumber(asteroid.estimated_diameter?.meters?.estimated_diameter_max)} m
                          </div>
                        </div>
                        {asteroid.is_potentially_hazardous_asteroid && (
                          <div className='mt-2 text-xs text-red-400 flex items-center'>
                            <AlertCircle className='w-3 h-3 mr-1' />
                            Potentially Hazardous
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Panel - Details */}
              <div className='flex-1 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden'>
                {selectedAsteroid ? (
                  <div className='h-full overflow-y-auto p-6'>
                    <h2 className='text-2xl font-bold text-white mb-4'>{selectedAsteroid.name}</h2>
                    
                    <div className='space-y-6'>
                      {/* Threat Assessment */}
                      <div>
                        <h3 className='text-lg font-semibold text-white mb-3'>Threat Assessment</h3>
                        <div className='bg-slate-800 rounded-lg p-4'>
                          <div className={`text-2xl font-bold mb-2 ${getThreatColor(getThreatLevel(selectedAsteroid))}`}>
                            {getThreatLevel(selectedAsteroid).toUpperCase()} RISK
                          </div>
                          {selectedAsteroid.is_potentially_hazardous_asteroid && (
                            <div className='text-red-400 flex items-center mt-2'>
                              <AlertCircle className='w-4 h-4 mr-2' />
                              Flagged as Potentially Hazardous Asteroid (PHA)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Physical Characteristics */}
                      <div>
                        <h3 className='text-lg font-semibold text-white mb-3'>Physical Characteristics</h3>
                        <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
                          <div className='flex justify-between'>
                            <span className='text-slate-400'>Diameter (Est.)</span>
                            <span className='text-white font-medium'>
                              {formatNumber(selectedAsteroid.estimated_diameter?.meters?.estimated_diameter_min)} - {formatNumber(selectedAsteroid.estimated_diameter?.meters?.estimated_diameter_max)} m
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-400'>Absolute Magnitude</span>
                            <span className='text-white font-medium'>{selectedAsteroid.absolute_magnitude_h}</span>
                          </div>
                        </div>
                      </div>

                      {/* Approach Data */}
                      {selectedAsteroid.close_approach_data?.[0] && (
                        <div>
                          <h3 className='text-lg font-semibold text-white mb-3'>Close Approach Data</h3>
                          <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Approach Date</span>
                              <span className='text-white font-medium'>
                                {formatDate(selectedAsteroid.close_approach_data[0].close_approach_date_full)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Miss Distance</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.close_approach_data[0].miss_distance?.kilometers)} km
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Relative Velocity</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.close_approach_data[0].relative_velocity?.kilometers_per_hour)} km/h
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Orbiting Body</span>
                              <span className='text-white font-medium'>
                                {selectedAsteroid.close_approach_data[0].orbiting_body}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* NASA JPL Link */}
                      <div>
                        <a 
                          href={selectedAsteroid.nasa_jpl_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className='block bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg transition-colors'
                        >
                          View on NASA JPL →
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='h-full flex items-center justify-center text-slate-400'>
                    Select an asteroid to view details
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AstroidPlayer