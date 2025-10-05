import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Zap, MapPin, Activity, Target, Flame, Wind, Users, ArrowLeft, Rocket, Globe, Radio, Home } from 'lucide-react';

const getZoneColor = (key) => ({
  totalDestruction: '#FF1744',
  severeBlastDamage: '#FF9100',
  moderateBlastDamage: '#FFD600',
  lightBlastDamage: '#00E676'
}[key] || '#AAA');

const getThermalColor = (key) => ({
  thirdDegreeBurns: '#FF1744',
  secondDegreeBurns: '#FF9100',
  ignitionZone: '#FFD600'
}[key] || '#AAA');

const formatNumber = (num) => num ? Number(num).toLocaleString() : '0';

export default function ImpactDashboard() {
  const canvasRef = useRef(null);
  const [customData, setCustomData] = useState({
    date: new Date().toISOString().slice(0,10),
    lat: 51.5074,
    long: -0.1278,
    velocity: 25,
    diameter: 100,
    miss: 0
  });
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Animated space background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02
    }));

    const asteroids = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 30 + 20,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0) {
          star.twinkleSpeed *= -1;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.opacity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);

        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const sides = 8;
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const radius = asteroid.size * (0.7 + Math.random() * 0.3);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#475569';
        for (let i = 0; i < 3; i++) {
          const craterX = (Math.random() - 0.5) * asteroid.size * 0.6;
          const craterY = (Math.random() - 0.5) * asteroid.size * 0.6;
          const craterSize = Math.random() * asteroid.size * 0.15;
          ctx.beginPath();
          ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        asteroid.x += asteroid.speedX;
        asteroid.y += asteroid.speedY;
        asteroid.rotation += asteroid.rotationSpeed;

        if (asteroid.x < -asteroid.size) asteroid.x = canvas.width + asteroid.size;
        if (asteroid.x > canvas.width + asteroid.size) asteroid.x = -asteroid.size;
        if (asteroid.y < -asteroid.size) asteroid.y = canvas.height + asteroid.size;
        if (asteroid.y > canvas.height + asteroid.size) asteroid.y = -asteroid.size;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => setCustomData({...customData, [e.target.name]: e.target.value});

  const submitCustomHit = async () => {
    const API_BASE = 'https://nasa-meteor-madness.onrender.com';
    try {
      setLoading(true);
      // Close the map to ensure refresh
      setShowMap(false);
      
      const response = await fetch(`${API_BASE}/custom-hit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customData)
      });
      if (!response.ok) throw new Error('Failed to submit custom hit');
      const result = await response.json();
      setSelectedAsteroid(result.data);
      
      // Wait a brief moment then reopen the map
      setTimeout(() => {
        setShowMap(true);
      }, 100);
    } catch (err) {
      alert(err.message);
      // Reopen map even if there's an error
      setShowMap(true);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setSelectedAsteroid(null);
    setShowMap(true);
  };

  const renderLegend = (type) => {
    switch(type) {
      case 'blast':
        return (
          <div className="flex gap-3 flex-wrap mt-4 mb-4">
            <LegendItem color="#FF1744" label="Total Destruction" icon={<Zap className="w-4 h-4" />} />
            <LegendItem color="#FF9100" label="Severe Damage" icon={<Flame className="w-4 h-4" />} />
            <LegendItem color="#FFD600" label="Moderate Damage" icon={<Wind className="w-4 h-4" />} />
            <LegendItem color="#00E676" label="Light Damage" icon={<Activity className="w-4 h-4" />} />
          </div>
        );
      case 'thermal':
        return (
          <div className="flex gap-3 flex-wrap mt-4 mb-4">
            <LegendItem color="#FF1744" label="3rd Degree Burns" icon={<Flame className="w-4 h-4" />} />
            <LegendItem color="#FF9100" label="2nd Degree Burns" icon={<Flame className="w-4 h-4" />} />
            <LegendItem color="#FFD600" label="Fire Ignition" icon={<Radio className="w-4 h-4" />} />
          </div>
        );
      case 'evacuation':
        return (
          <div className="flex gap-3 flex-wrap mt-4 mb-4">
            {selectedAsteroid?.blastRadiusData?.evacuationZones && Object.entries(selectedAsteroid.blastRadiusData.evacuationZones).map(([zone, data]) => (
              <LegendItem key={zone} color={data.color || '#2196F3'} label={`${zone.toUpperCase()} (${data.priority})`} icon={<Users className="w-4 h-4" />} />
            ))}
          </div>
        );
      default: return null;
    }
  };

  const LegendItem = ({color, label, icon}) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 backdrop-blur-sm rounded-full border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300">
      <span className="w-3 h-3 rounded-full shadow-lg" style={{backgroundColor: color, boxShadow: `0 0 10px ${color}`}}></span>
      {icon && <span className="text-slate-300">{icon}</span>}
      <span className="text-sm font-semibold text-slate-200">{label}</span>
    </div>
  );

  const renderMapCircles = (type) => {
    if(!selectedAsteroid) return null;
    switch(type) {
      case 'blast':
        return Object.entries(selectedAsteroid.blastRadiusData?.blastEffects || {}).map(([key, zone], idx) => (
          <Circle
            key={idx}
            center={[customData.lat, customData.long]}
            radius={zone.radius > 1 ? zone.radius * 1000 : 500}
            pathOptions={{ color: getZoneColor(key), fillOpacity: 0.3 }}
          >
            <Popup>
              <strong>{key}</strong><br/>
              Radius: {zone.radius} km<br/>
              Survivability: {zone.survivability}
            </Popup>
          </Circle>
        ));
      case 'thermal':
        return Object.entries(selectedAsteroid.blastRadiusData?.thermalRadiation || {}).map(([key, zone], idx) => (
          <Circle
            key={idx}
            center={[customData.lat, customData.long]}
            radius={zone.radius > 1 ? zone.radius * 1000 : 500}
            pathOptions={{ color: getThermalColor(key), fillOpacity: 0.2 }}
          >
            <Popup>
              <strong>{key}</strong><br/>
              Radius: {zone.radius} km
            </Popup>
          </Circle>
        ));
      case 'evacuation':
        return Object.entries(selectedAsteroid.blastRadiusData?.evacuationZones || {}).map(([zoneName, zone], idx) => (
          <Circle
            key={idx}
            center={[customData.lat, customData.long]}
            radius={zone.radius > 1 ? zone.radius * 1000 : 500}
            pathOptions={{ color: zone.color || '#2196F3', fillOpacity: 0.1 }}
          >
            <Popup>
              <strong>{zoneName}</strong><br/>
              Radius: {zone.radius} km<br/>
              {zone.description}
            </Popup>
          </Circle>
        ));
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ background: 'linear-gradient(to bottom, #0f172a, #020617)' }}
      />

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Bar */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className='bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 border border-cyan-500/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
            >
              <Home className='w-4 h-4' />
              Home
            </button>
            <button
              onClick={() => window.location.href = '/asteroidplayer'}
              className='bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 border border-cyan-500/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
            >
              <Activity className='w-4 h-4' />
              Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/hit'}
              className='bg-cyan-600/80 backdrop-blur-md hover:bg-cyan-700 border border-cyan-500/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
            >
              <Target className='w-4 h-4' />
              Impact History
            </button>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className='text-4xl font-bold text-white mb-2'>
                  Asteroid Impact <span className='font-light text-cyan-400'>Simulator</span>
                </h1>
                <p className='text-slate-400'>Real-time impact analysis and visualization system</p>
              </div>
            </div>
          </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-6 mb-6 border border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Custom Impact Scenario
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {label: 'Impact Date', name: 'date', type:'date', value: customData.date, icon: <Target className="w-4 h-4" />},
              {label: 'Latitude', name:'lat', type:'number', value: customData.lat, icon: <MapPin className="w-4 h-4" />},
              {label: 'Longitude', name:'long', type:'number', value: customData.long, icon: <MapPin className="w-4 h-4" />},
              {label: 'Velocity (km/s)', name:'velocity', type:'number', value: customData.velocity, icon: <Zap className="w-4 h-4" />},
              {label: 'Diameter (m)', name:'diameter', type:'number', value: customData.diameter, icon: <Activity className="w-4 h-4" />},
              {label: 'Miss Distance (km)', name:'miss', type:'number', value: customData.miss, icon: <Radio className="w-4 h-4" />}
            ].map(field => (
              <div className="flex flex-col group" key={field.name}>
                <label className="block text-slate-400 text-sm mb-2">
                  <span className="text-cyan-400">{field.icon}</span>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={field.value}
                  onChange={handleChange}
                  className="p-3 rounded-xl bg-slate-800/70 backdrop-blur-sm text-white border border-slate-700/60 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/60 transition-all duration-300 hover:bg-slate-800/90 hover:border-slate-600/80"
                  step={field.type === 'number' ? 'any' : undefined}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button 
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              onClick={submitCustomHit} 
              disabled={loading}
            >
              <Zap className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Simulating Impact...' : 'Run Simulation'}
            </button>
            
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              onClick={resetSimulation}
            >
              <Target className="w-5 h-5" />
              Reset Simulation
            </button>
          </div>
        </div>

        {/* Tabs Section */}
        {selectedAsteroid && (
          <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-6 border border-slate-700">
            <Tabs>
              <TabList className="flex gap-3 mb-6 border-b border-slate-700 pb-4">
                <Tab className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Blast Zones
                </Tab>
                <Tab className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Thermal Radiation
                </Tab>
                <Tab className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Evacuation Zones
                </Tab>
              </TabList>

              <TabPanel>
                {renderLegend('blast')}
                <div className="rounded-xl overflow-hidden border-2 border-slate-700/60 shadow-2xl">
                  {showMap ? (
                    <MapContainer key={`blast-${Date.now()}`} center={[customData.lat, customData.long]} zoom={8} style={{ height: '600px', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors"/>
                      {renderMapCircles('blast')}
                    </MapContainer>
                  ) : (
                    <div className="h-[600px] w-full bg-slate-800 flex items-center justify-center">
                      <div className="text-white">Loading map...</div>
                    </div>
                  )}
                </div>
              </TabPanel>

              <TabPanel>
                {renderLegend('thermal')}
                <div className="rounded-xl overflow-hidden border-2 border-slate-700/60 shadow-2xl">
                  {showMap ? (
                    <MapContainer key={`thermal-${Date.now()}`} center={[customData.lat, customData.long]} zoom={8} style={{ height: '600px', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors"/>
                      {renderMapCircles('thermal')}
                    </MapContainer>
                  ) : (
                    <div className="h-[600px] w-full bg-slate-800 flex items-center justify-center">
                      <div className="text-white">Loading map...</div>
                    </div>
                  )}
                </div>
              </TabPanel>

              <TabPanel>
                {renderLegend('evacuation')}
                <div className="rounded-xl overflow-hidden border-2 border-slate-700/60 shadow-2xl">
                  {showMap ? (
                    <MapContainer key={`evacuation-${Date.now()}`} center={[customData.lat, customData.long]} zoom={8} style={{ height: '600px', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors"/>
                      {renderMapCircles('evacuation')}
                    </MapContainer>
                  ) : (
                    <div className="h-[600px] w-full bg-slate-800 flex items-center justify-center">
                      <div className="text-white">Loading map...</div>
                    </div>
                  )}
                </div>
              </TabPanel>
            </Tabs>
          </div>
        )}
      </div>

      <style>{`
        .react-tabs__tab--selected {
          background: linear-gradient(to right, rgb(6, 182, 212), rgb(59, 130, 246)) !important;
          color: white !important;
          border-color: rgb(6, 182, 212) !important;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
        }
      `}</style>
      </div>
    </div>
  );
}