import React, { useState, useEffect, useRef } from 'react'
import { AlertCircle, TrendingUp, Gauge, MapPin, Zap, Plus, X, Home, Activity } from 'lucide-react'

const AstroidDashboard = () => {
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
  const canvasRef = useRef(null)

  // Animated space background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02
    }))

    const asteroids = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 30 + 20,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    }))

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        star.opacity += star.twinkleSpeed
        if (star.opacity > 1 || star.opacity < 0) {
          star.twinkleSpeed *= -1
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.opacity)})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })

      asteroids.forEach(asteroid => {
        ctx.save()
        ctx.translate(asteroid.x, asteroid.y)
        ctx.rotate(asteroid.rotation)

        ctx.fillStyle = '#64748b'
        ctx.strokeStyle = '#475569'
        ctx.lineWidth = 2
        ctx.beginPath()
        const sides = 8
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2
          const radius = asteroid.size * (0.7 + Math.random() * 0.3)
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#475569'
        for (let i = 0; i < 3; i++) {
          const craterX = (Math.random() - 0.5) * asteroid.size * 0.6
          const craterY = (Math.random() - 0.5) * asteroid.size * 0.6
          const craterSize = Math.random() * asteroid.size * 0.15
          ctx.beginPath()
          ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()

        asteroid.x += asteroid.speedX
        asteroid.y += asteroid.speedY
        asteroid.rotation += asteroid.rotationSpeed

        if (asteroid.x < -asteroid.size) asteroid.x = canvas.width + asteroid.size
        if (asteroid.x > canvas.width + asteroid.size) asteroid.x = -asteroid.size
        if (asteroid.y < -asteroid.size) asteroid.y = canvas.height + asteroid.size
        if (asteroid.y > canvas.height + asteroid.size) asteroid.y = -asteroid.size
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
            astronomical: result.data.input.approach ? result.data.input.approach.lunarDistances / 389 : 0,
            lunar: result.data.input.approach ? result.data.input.approach.lunarDistances : 0,
            kilometers: result.data.input.missDistance.kilometers,
            miles: result.data.input.missDistance.kilometers * 0.621371
          },
          calculations: result.data.calculations
        },
        geographicImpactData: result.data.geographicImpactData,
        earthquakeData: result.data.earthquakeData
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

  const getAverageDiameter = () => {
    if (allAsteroids.length === 0) return 0
    const total = allAsteroids.reduce((sum, ast) => sum + (ast.diameter?.average || 0), 0)
    return total / allAsteroids.length
  }

  const getAverageVelocity = () => {
    if (allAsteroids.length === 0) return 0
    const total = allAsteroids.reduce((sum, ast) => 
      sum + (ast.primaryApproach?.velocity?.kilometersPerHour || 0), 0)
    return total / allAsteroids.length
  }

  return (
    <div className='relative min-h-screen overflow-hidden'>
      <canvas
        ref={canvasRef}
        className='fixed inset-0 w-full h-full'
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)' }}
      />

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-6 flex items-center gap-4'>
            <button
              onClick={() => window.location.href = '/'}
              className='bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 border border-cyan-500/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
            >
              <Home className='w-4 h-4' />
              Home
            </button>
            <div className='h-6 w-px bg-slate-700'></div>
            <span className='text-slate-400 text-sm'>Asteroid Detection System</span>
          </div>

          <div className='mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-white mb-2'>
                  Astro <span className='font-light text-cyan-400'>Meteoroid Detection</span>
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
                    className='bg-slate-900/80 backdrop-blur-md text-white px-3 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-xs mb-1'>End Date</label>
                  <input
                    type='date'
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className='bg-slate-900/80 backdrop-blur-md text-white px-3 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
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
              className='mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105'
            >
              {showCustomForm ? <X className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
              {showCustomForm ? 'Close' : 'Create Custom Impact Scenario'}
            </button>
          </div>

          {showCustomForm && (
            <div className='bg-slate-900/80 backdrop-blur-md rounded-lg border border-cyan-500/30 p-6 mb-8'>
              <h2 className='text-2xl font-bold text-white mb-4'>Custom Impact Scenario</h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Date (YYYY-MM-DD)</label>
                  <input
                    type='text'
                    value={customData.date}
                    onChange={(e) => handleCustomInputChange('date', e.target.value)}
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Diameter (meters)</label>
                  <input
                    type='number'
                    value={customData.diameter}
                    onChange={(e) => handleCustomInputChange('diameter', parseFloat(e.target.value))}
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Latitude</label>
                  <input
                    type='number'
                    step='0.0001'
                    value={customData.lat}
                    onChange={(e) => handleCustomInputChange('lat', parseFloat(e.target.value))}
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Longitude</label>
                  <input
                    type='number'
                    step='0.0001'
                    value={customData.long}
                    onChange={(e) => handleCustomInputChange('long', parseFloat(e.target.value))}
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Velocity (km/s)</label>
                  <input
                    type='number'
                    step='0.1'
                    value={customData.velocity}
                    onChange={(e) => handleCustomInputChange('velocity', parseFloat(e.target.value))}
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Density (kg/m³)</label>
                  <input
                    type='number'
                    value={customData.density}
                    onChange={(e) => handleCustomInputChange('density', parseFloat(e.target.value))}
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Approach Distance (LD)</label>
                  <input
                    type='number'
                    step='0.1'
                    value={customData.approach}
                    onChange={(e) => handleCustomInputChange('approach', parseFloat(e.target.value))}
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Miss Distance (km)</label>
                  <input
                    type='number'
                    value={customData.miss}
                    onChange={(e) => handleCustomInputChange('miss', parseFloat(e.target.value))}
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-slate-400 text-sm mb-2'>Mass (kg) - Optional</label>
                  <input
                    type='number'
                    value={customData.mass}
                    onChange={(e) => handleCustomInputChange('mass', e.target.value)}
                    placeholder='Auto-calculated if empty'
                    className='w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:border-cyan-500 outline-none'
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

          {loading && !showCustomForm ? (
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
              <div className='grid grid-cols-4 gap-4 mb-8'>
                <div className='bg-slate-900/80 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30'>
                  <div className='text-slate-400 text-sm mb-1'>Total Detected</div>
                  <div className='text-3xl font-bold text-white'>
                    {asteroidData?.summary?.totalNEOs || 0}
                  </div>
                </div>
                <div className='bg-slate-900/80 backdrop-blur-md rounded-lg p-4 border border-red-500/30'>
                  <div className='text-slate-400 text-sm mb-1'>Hazardous</div>
                  <div className='text-3xl font-bold text-red-500'>
                    {asteroidData?.summary?.hazardousCount || 0}
                  </div>
                </div>
                <div className='bg-slate-900/80 backdrop-blur-md rounded-lg p-4 border border-blue-500/30'>
                  <div className='text-slate-400 text-sm mb-1'>Avg Diameter</div>
                  <div className='text-3xl font-bold text-blue-400'>
                    {formatNumber(getAverageDiameter())} m
                  </div>
                </div>
                <div className='bg-slate-900/80 backdrop-blur-md rounded-lg p-4 border border-purple-500/30'>
                  <div className='text-slate-400 text-sm mb-1'>Avg Velocity</div>
                  <div className='text-3xl font-bold text-purple-400'>
                    {formatNumber(getAverageVelocity())} km/h
                  </div>
                </div>
              </div>

              <div className='flex gap-6 h-[600px]'>
                <div className='w-2/5 bg-slate-900/80 backdrop-blur-md rounded-lg border border-cyan-500/30 overflow-hidden flex flex-col'>
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

                <div className='flex-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-cyan-500/30 overflow-hidden'>
                  {selectedAsteroid ? (
                    <div className='h-full overflow-y-auto p-6'>
                      <h2 className='text-2xl font-bold text-white mb-4'>{selectedAsteroid.name}</h2>
                      
                      <div className='space-y-6'>
                        <div>
                          <h3 className='text-lg font-semibold text-white mb-3'>Threat Assessment</h3>
                          <div className='bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 border border-slate-700'>
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

                        <div>
                          <h3 className='text-lg font-semibold text-white mb-3'>Physical Characteristics</h3>
                          <div className='bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 space-y-3 border border-slate-700'>
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

                        {selectedAsteroid.primaryApproach && (
                          <div>
                            <h3 className='text-lg font-semibold text-white mb-3'>Close Approach Data</h3>
                            <div className='bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 space-y-3 border border-slate-700'>
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

                        {selectedAsteroid.primaryApproach?.calculations && (
                          <div>
                            <h3 className='text-lg font-semibold text-white mb-3'>
                              <Zap className='inline w-5 h-5 mr-2' />
                              Impact Calculations
                            </h3>
                            <div className='bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 space-y-3 border border-slate-700'>
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

                        {selectedAsteroid.geographicImpactData && (
                          <div>
                            <h3 className='text-lg font-semibold text-white mb-3'>
                              <MapPin className='inline w-5 h-5 mr-2' />
                              Geographic Impact Analysis
                            </h3>
                            <div className='bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 space-y-3 border border-slate-700'>
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

                        {selectedAsteroid.earthquakeData && (
                          <div>
                            <h3 className='text-lg font-semibold text-white mb-3'>
                              <Activity className='inline w-5 h-5 mr-2' />
                              Seismic Impact Analysis
                            </h3>
                            
                            <div className='bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-slate-700'>
                              <h4 className='text-white font-semibold mb-3'>Earthquake Magnitude</h4>
                              <div className='space-y-3'>
                                <div className='flex justify-between'>
                                  <span className='text-slate-400'>Richter Scale</span>
                                  <span className='text-red-400 font-bold text-xl'>
                                    {formatNumber(selectedAsteroid.earthquakeData.seismicMagnitude?.richterMagnitude)}
                                  </span>
                                </div>
                                <div className='flex justify-between'>
                                  <span className='text-slate-400'>Moment Magnitude</span>
                                  <span className='text-red-400 font-bold text-xl'>
                                    {formatNumber(selectedAsteroid.earthquakeData.seismicMagnitude?.momentMagnitude)}
                                  </span>
                                </div>
                                <div className='flex justify-between'>
                                  <span className='text-slate-400'>Classification</span>
                                  <span className='text-white font-medium text-sm'>
                                    {selectedAsteroid.earthquakeData.seismicMagnitude?.magnitudeClass}
                                  </span>
                                </div>
                                {selectedAsteroid.earthquakeData.seismicMagnitude?.equivalentEarthquake && (
                                  <div className='mt-3 p-3 bg-slate-900/70 backdrop-blur-sm rounded text-sm'>
                                    <div className='text-slate-400 mb-1'>Comparable to:</div>
                                    <div className='text-white'>
                                      {selectedAsteroid.earthquakeData.seismicMagnitude.equivalentEarthquake.name} 
                                      ({selectedAsteroid.earthquakeData.seismicMagnitude.equivalentEarthquake.year})
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {selectedAsteroid.earthquakeData.regionalEffects && (
                              <div className='bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-slate-700'>
                                <h4 className='text-white font-semibold mb-3'>Regional Effects</h4>
                                <div className='space-y-3'>
                                  <div className='p-3 bg-red-900/30 border border-red-800 rounded'>
                                    <div className='font-semibold text-red-400 mb-1 text-sm'>
                                      Epicenter (10 km)
                                    </div>
                                    <div className='text-xs space-y-1'>
                                      <div className='flex justify-between'>
                                        <span className='text-slate-400'>MMI</span>
                                        <span className='text-white'>
                                          {selectedAsteroid.earthquakeData.regionalEffects.epicenter?.modifiedMercalliIntensity}
                                        </span>
                                      </div>
                                      <div className='text-slate-300'>
                                        {selectedAsteroid.earthquakeData.regionalEffects.epicenter?.expectedDamage}
                                      </div>
                                    </div>
                                  </div>

                                  <div className='p-3 bg-orange-900/30 border border-orange-800 rounded'>
                                    <div className='font-semibold text-orange-400 mb-1 text-sm'>
                                      Near Field (100 km)
                                    </div>
                                    <div className='text-xs text-slate-300'>
                                      {selectedAsteroid.earthquakeData.regionalEffects.nearField?.expectedDamage}
                                    </div>
                                  </div>

                                  <div className='p-3 bg-yellow-900/30 border border-yellow-800 rounded'>
                                    <div className='font-semibold text-yellow-400 mb-1 text-sm'>
                                      Far Field (500 km)
                                    </div>
                                    <div className='text-xs text-slate-300'>
                                      {selectedAsteroid.earthquakeData.regionalEffects.farField?.expectedDamage}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedAsteroid.earthquakeData.globalImpact && (
                              <div className='bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4'>
                                <h4 className='text-red-400 font-semibold mb-2'>Global Impact</h4>
                                <div className='space-y-1 text-sm'>
                                  <div className='flex justify-between'>
                                    <span className='text-slate-400'>Level</span>
                                    <span className='text-red-400 font-bold'>
                                      {selectedAsteroid.earthquakeData.globalImpact.level}
                                    </span>
                                  </div>
                                  <div className='text-slate-300 text-xs'>
                                    <div>{selectedAsteroid.earthquakeData.globalImpact.description}</div>
                                    <div className='mt-2'>Casualties: {selectedAsteroid.earthquakeData.globalImpact.casualties}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedAsteroid.earthquakeData.warnings && selectedAsteroid.earthquakeData.warnings.length > 0 && (
                              <div className='space-y-2'>
                                {selectedAsteroid.earthquakeData.warnings.map((warning, idx) => (
                                  <div 
                                    key={idx}
                                    className={`p-3 rounded-lg border text-sm ${
                                      warning.severity === 'CRITICAL' ? 'bg-red-900/30 border-red-800 text-red-300' :
                                      warning.severity === 'EXTREME' ? 'bg-orange-900/30 border-orange-800 text-orange-300' :
                                      'bg-blue-900/30 border-blue-800 text-blue-300'
                                    }`}
                                  >
                                    <div className='font-semibold mb-1'>{warning.severity}</div>
                                    <div className='text-xs'>{warning.message}</div>
                                  </div>
                                ))}
                              </div>
                            )}
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
    </div>
  )
}

export default AstroidDashboard