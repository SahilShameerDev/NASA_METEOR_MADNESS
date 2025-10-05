import React, { useState, useEffect } from 'react'
import { AlertCircle, TrendingUp, Calendar, Gauge, MapPin, Zap, Plus, X } from 'lucide-react'

const AstroidPlayer = () => {
  const [asteroidData, setAsteroidData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAsteroid, setSelectedAsteroid] = useState(null)
  const [dateRange, setDateRange] = useState({
    start: '2025-09-01',
    end: '2025-09-07'
  })
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customData, setCustomData] = useState({
    date: '2026-03-15',
    lat: -23.5505,
    long: -46.6333,
    velocity: 30.2,
    diameter: 500,
    mass: '',
    density: 3000,
    approach: 5.2,
    miss: 25000,
    hazard: true
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
      console.log('API Response:', data)
      setAsteroidData(data)
      
      // Get first asteroid from processedDates
      if (data.processedDates && data.processedDates.length > 0) {
        const firstDate = data.processedDates[0]
        if (firstDate.neos && firstDate.neos.length > 0) {
          setSelectedAsteroid(firstDate.neos[0])
        }
      }
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitCustomHit = async () => {
    const API_BASE = 'http://localhost:3000'
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/custom-hit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customData)
      })
      
      if (!response.ok) throw new Error('Failed to submit custom hit')
      const result = await response.json()
      console.log('Custom Hit Response:', result)
      
      // Convert custom hit response to match asteroid structure
      const customAsteroid = {
        id: 'CUSTOM-' + Date.now(),
        name: 'Custom Impact Scenario',
        isPotentiallyHazardous: customData.hazard,
        absoluteMagnitude: 0,
        diameter: {
          min: result.data.input.size.diameter,
          max: result.data.input.size.diameter,
          average: result.data.input.size.diameter,
          unit: 'meters'
        },
        primaryApproach: {
          closeApproachDate: result.data.input.date,
          closeApproachDateFull: result.data.geographicImpactData.impactLocation.impactTimestamp,
          orbitingBody: 'Earth',
          velocity: result.data.input.velocity,
          missDistance: {
            astronomical: result.data.input.approach.lunarDistances / 389,
            lunar: result.data.input.approach.lunarDistances,
            kilometers: result.data.input.missDistance.kilometers,
            miles: result.data.input.missDistance.kilometers * 0.621371
          },
          calculations: result.data.calculations
        },
        geographicImpactData: result.data.geographicImpactData
      }
      
      setSelectedAsteroid(customAsteroid)
      setShowCustomForm(false)
      setError(null)
      alert('Custom impact scenario created successfully!')
    } catch (err) {
      setError(err.message)
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomInputChange = (field, value) => {
    setCustomData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Flatten all asteroids from all dates
  const getAllAsteroids = () => {
    if (!asteroidData?.processedDates) return []
    return asteroidData.processedDates.flatMap(dateObj => dateObj.neos || [])
  }

  const getThreatLevel = (asteroid) => {
    if (!asteroid) return 'unknown'
    const riskLevel = asteroid.primaryApproach?.calculations?.impactProbability?.riskLevel
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') return 'high'
    if (riskLevel === 'MODERATE') return 'medium'
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
    if (num === null || num === undefined) return 'N/A'
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

  const allAsteroids = getAllAsteroids()

  // Calculate average diameter from all asteroids
  const getAverageDiameter = () => {
    if (allAsteroids.length === 0) return 0
    const total = allAsteroids.reduce((sum, ast) => sum + (ast.diameter?.average || 0), 0)
    return total / allAsteroids.length
  }

  // Calculate average velocity from all asteroids
  const getAverageVelocity = () => {
    if (allAsteroids.length === 0) return 0
    const total = allAsteroids.reduce((sum, ast) => 
      sum + (ast.primaryApproach?.velocity?.kilometersPerHour || 0), 0)
    return total / allAsteroids.length
  }

  return (
    <div className='w-full min-h-screen bg-slate-950 p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-white mb-2'>
                Astro <span className='font-light text-blue-400'>Meteoroid Detection</span>
              </h1>
              <p className='text-slate-400'>Real-time Near-Earth Object monitoring system</p>
            </div>
            
            <div className='flex items-center gap-4'>
              <div>
                <label className='block text-slate-400 text-xs mb-1'>Start Date</label>
                <input
                  type='date'
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className='bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-xs mb-1'>End Date</label>
                <input
                  type='date'
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className='bg-slate-800 text-white px-3 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <button
                onClick={fetchAsteroidData}
                disabled={loading}
                className='mt-5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors'
              >
                {loading ? 'Loading...' : 'Fetch Data'}
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
          >
            {showCustomForm ? <X className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
            {showCustomForm ? 'Close' : 'Create Custom Impact Scenario'}
          </button>
        </div>

        {/* Custom Hit Form */}
        {showCustomForm && (
          <div className='bg-slate-900 rounded-lg border border-slate-800 p-6 mb-8'>
            <h2 className='text-2xl font-bold text-white mb-4'>Custom Impact Scenario</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Date (YYYY-MM-DD)</label>
                <input
                  type='text'
                  value={customData.date}
                  onChange={(e) => handleCustomInputChange('date', e.target.value)}
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Diameter (meters)</label>
                <input
                  type='number'
                  value={customData.diameter}
                  onChange={(e) => handleCustomInputChange('diameter', parseFloat(e.target.value))}
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Latitude (decimal degrees)</label>
                <input
                  type='number'
                  step='0.0001'
                  value={customData.lat}
                  onChange={(e) => handleCustomInputChange('lat', parseFloat(e.target.value))}
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Longitude (decimal degrees)</label>
                <input
                  type='number'
                  step='0.0001'
                  value={customData.long}
                  onChange={(e) => handleCustomInputChange('long', parseFloat(e.target.value))}
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Velocity (km/s)</label>
                <input
                  type='number'
                  step='0.1'
                  value={customData.velocity}
                  onChange={(e) => handleCustomInputChange('velocity', parseFloat(e.target.value))}
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Density (kg/m³)</label>
                <input
                  type='number'
                  value={customData.density}
                  onChange={(e) => handleCustomInputChange('density', parseFloat(e.target.value))}
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Approach Distance (Lunar Distances)</label>
                <input
                  type='number'
                  step='0.1'
                  value={customData.approach}
                  onChange={(e) => handleCustomInputChange('approach', parseFloat(e.target.value))}
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Miss Distance (km)</label>
                <input
                  type='number'
                  value={customData.miss}
                  onChange={(e) => handleCustomInputChange('miss', parseFloat(e.target.value))}
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div>
                <label className='block text-slate-400 text-sm mb-2'>Mass (kg) - Optional</label>
                <input
                  type='number'
                  value={customData.mass}
                  onChange={(e) => handleCustomInputChange('mass', e.target.value)}
                  placeholder='Auto-calculated if empty'
                  className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-blue-500 outline-none'
                />
              </div>
              <div className='flex items-end'>
                <label className='flex items-center text-white cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={customData.hazard}
                    onChange={(e) => handleCustomInputChange('hazard', e.target.checked)}
                    className='w-5 h-5 mr-2'
                  />
                  Potentially Hazardous
                </label>
              </div>
            </div>
            <button
              onClick={submitCustomHit}
              disabled={loading}
              className='mt-6 w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white py-3 rounded-lg font-semibold transition-colors'
            >
              {loading ? 'Processing...' : 'Calculate Impact'}
            </button>
          </div>
        )}

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
                <div className='text-3xl font-bold text-white'>
                  {asteroidData?.summary?.totalNEOs || 0}
                </div>
              </div>
              <div className='bg-slate-900 rounded-lg p-4 border border-slate-800'>
                <div className='text-slate-400 text-sm mb-1'>Hazardous</div>
                <div className='text-3xl font-bold text-red-500'>
                  {asteroidData?.summary?.hazardousCount || 0}
                </div>
              </div>
              <div className='bg-slate-900 rounded-lg p-4 border border-slate-800'>
                <div className='text-slate-400 text-sm mb-1'>Avg Diameter</div>
                <div className='text-3xl font-bold text-blue-400'>
                  {formatNumber(getAverageDiameter())} m
                </div>
              </div>
              <div className='bg-slate-900 rounded-lg p-4 border border-slate-800'>
                <div className='text-slate-400 text-sm mb-1'>Avg Velocity</div>
                <div className='text-3xl font-bold text-purple-400'>
                  {formatNumber(getAverageVelocity())} km/h
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
                    {allAsteroids.length} asteroids in range
                  </p>
                </div>
                <div className='overflow-y-auto flex-1'>
                  {allAsteroids.map((asteroid, idx) => {
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
                            <div className='text-xs text-slate-400'>ID: {asteroid.id}</div>
                          </div>
                          <div className={`text-xs font-semibold px-2 py-1 rounded ${getThreatColor(threatLevel)} bg-slate-800`}>
                            {threatLevel.toUpperCase()}
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-2 text-xs text-slate-400'>
                          <div>
                            <TrendingUp className='inline w-3 h-3 mr-1' />
                            {formatNumber(asteroid.primaryApproach?.velocity?.kilometersPerHour)} km/h
                          </div>
                          <div>
                            <Gauge className='inline w-3 h-3 mr-1' />
                            {formatNumber(asteroid.diameter?.average)} m
                          </div>
                        </div>
                        {asteroid.isPotentiallyHazardous && (
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
                            {selectedAsteroid.primaryApproach?.calculations?.impactProbability?.riskLevel || 'UNKNOWN'} RISK
                          </div>
                          <div className='text-slate-300 text-sm mb-2'>
                            Impact Probability: {selectedAsteroid.primaryApproach?.calculations?.impactProbability?.percentage}%
                          </div>
                          {selectedAsteroid.isPotentiallyHazardous && (
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
                            <span className='text-slate-400'>Diameter Range</span>
                            <span className='text-white font-medium'>
                              {formatNumber(selectedAsteroid.diameter?.min)} - {formatNumber(selectedAsteroid.diameter?.max)} m
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-400'>Average Diameter</span>
                            <span className='text-white font-medium'>
                              {formatNumber(selectedAsteroid.diameter?.average)} m
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-400'>Absolute Magnitude</span>
                            <span className='text-white font-medium'>{selectedAsteroid.absoluteMagnitude}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-400'>Estimated Mass</span>
                            <span className='text-white font-medium'>
                              {formatNumber(selectedAsteroid.primaryApproach?.calculations?.mass?.value)} kg
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Approach Data */}
                      {selectedAsteroid.primaryApproach && (
                        <div>
                          <h3 className='text-lg font-semibold text-white mb-3'>Close Approach Data</h3>
                          <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Approach Date</span>
                              <span className='text-white font-medium'>
                                {formatDate(selectedAsteroid.primaryApproach.closeApproachDateFull)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Miss Distance</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.primaryApproach.missDistance?.kilometers)} km
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Miss Distance (Lunar)</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.primaryApproach.missDistance?.lunar)} LD
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Relative Velocity</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.primaryApproach.velocity?.kilometersPerHour)} km/h
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Orbiting Body</span>
                              <span className='text-white font-medium'>
                                {selectedAsteroid.primaryApproach.orbitingBody}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Impact Calculations */}
                      {selectedAsteroid.primaryApproach?.calculations && (
                        <div>
                          <h3 className='text-lg font-semibold text-white mb-3'>
                            <Zap className='inline w-5 h-5 mr-2' />
                            Impact Calculations
                          </h3>
                          <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Kinetic Energy</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.primaryApproach.calculations.kineticEnergy?.megatons)} Megatons
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Est. Crater Diameter</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.primaryApproach.calculations.estimatedCrater?.diameter)} m
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Est. Crater Radius</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.primaryApproach.calculations.estimatedCrater?.radius)} m
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Geographic Impact Data */}
                      {selectedAsteroid.geographicImpactData && (
                        <div>
                          <h3 className='text-lg font-semibold text-white mb-3'>
                            <MapPin className='inline w-5 h-5 mr-2' />
                            Geographic Impact Analysis
                          </h3>
                          <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Primary Region</span>
                              <span className='text-white font-medium'>
                                {selectedAsteroid.geographicImpactData.geographicRisk?.primaryRegion}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Impact Location</span>
                              <span className='text-white font-medium text-xs'>
                                {formatNumber(selectedAsteroid.geographicImpactData.impactLocation?.estimatedImpactPoint?.latitude)}°, 
                                {formatNumber(selectedAsteroid.geographicImpactData.impactLocation?.estimatedImpactPoint?.longitude)}°
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Affected Area</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.geographicImpactData.geographicRisk?.estimatedAffectedArea?.value)} km²
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Geographic Risk</span>
                              <span className='text-white font-medium'>
                                {selectedAsteroid.geographicImpactData.geographicRisk?.riskLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next Pass Estimate */}
                      {selectedAsteroid.primaryApproach?.calculations?.nextPassEstimate && (
                        <div>
                          <h3 className='text-lg font-semibold text-white mb-3'>Next Pass Estimate</h3>
                          <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Orbital Period</span>
                              <span className='text-white font-medium'>
                                {formatNumber(selectedAsteroid.primaryApproach.calculations.nextPassEstimate.estimatedOrbitalPeriod?.years)} years
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-slate-400'>Next Pass Date</span>
                              <span className='text-white font-medium'>
                                {selectedAsteroid.primaryApproach.calculations.nextPassEstimate.estimatedNextPass}
                              </span>
                            </div>
                            <div className='text-xs text-slate-400 italic'>
                              {selectedAsteroid.primaryApproach.calculations.nextPassEstimate.note}
                            </div>
                          </div>
                        </div>
                      )}
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