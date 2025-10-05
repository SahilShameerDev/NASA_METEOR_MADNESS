import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Zap, MapPin, Activity, Target, Flame, Wind, Users } from 'lucide-react';

// Helper functions
const getZoneColor = (key) => {
  switch(key) {
    case 'totalDestruction': return 'red';
    case 'severeBlastDamage': return 'orange';
    case 'moderateBlastDamage': return 'yellow';
    case 'lightBlastDamage': return 'green';
    default: return 'gray';
  }
};

const getThermalColor = (key) => {
  switch(key) {
    case 'thirdDegreeBurns': return 'red';
    case 'secondDegreeBurns': return 'orange';
    case 'ignitionZone': return 'yellow';
    default: return 'gray';
  }
};

const formatNumber = (num) => num ? Number(num).toLocaleString() : '0';

export default function ImpactDashboard() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomData({ ...customData, [name]: value });
  };

  const submitCustomHit = async () => {
    const API_BASE = 'https://nasa-meteor-madness.onrender.com';
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/custom-hit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customData)
      });
      if (!response.ok) throw new Error('Failed to submit custom hit');
      const result = await response.json();
      setSelectedAsteroid(result.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => setSelectedAsteroid(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asteroid Impact Simulator</h1>
        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          onClick={() => window.location.href='/'}
        >
          Home
        </button>
      </div>

      {/* Form Section */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-lg p-6 mb-6 space-y-4 border border-slate-700">
        <h2 className="text-xl font-semibold">Custom Impact Scenario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="date" name="date" value={customData.date} onChange={handleChange} className="p-2 rounded bg-slate-700 text-white"/>
          <input type="number" name="lat" value={customData.lat} onChange={handleChange} placeholder="Latitude" className="p-2 rounded bg-slate-700 text-white"/>
          <input type="number" name="long" value={customData.long} onChange={handleChange} placeholder="Longitude" className="p-2 rounded bg-slate-700 text-white"/>
          <input type="number" name="velocity" value={customData.velocity} onChange={handleChange} placeholder="Velocity (km/s)" className="p-2 rounded bg-slate-700 text-white"/>
          <input type="number" name="diameter" value={customData.diameter} onChange={handleChange} placeholder="Diameter (m)" className="p-2 rounded bg-slate-700 text-white"/>
          <input type="number" name="miss" value={customData.miss} onChange={handleChange} placeholder="Miss Distance (km)" className="p-2 rounded bg-slate-700 text-white"/>
        </div>
        <div className="flex gap-4 mt-4">
          <button 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
            onClick={submitCustomHit}
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run Simulation'}
          </button>
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
            onClick={resetSimulation}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Tabs for Maps */}
      {selectedAsteroid && (
        <Tabs>
          <TabList>
            <Tab>Blast Zones</Tab>
            <Tab>Thermal Radiation</Tab>
            <Tab>Evacuation Zones</Tab>
          </TabList>

          {/* Blast Zones */}
          <TabPanel>
            <MapContainer
              center={[customData.lat, customData.long]}
              zoom={5}
              style={{ height: '600px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {selectedAsteroid.blastRadiusData?.blastEffects && Object.entries(selectedAsteroid.blastRadiusData.blastEffects).map(([key, zone], idx) => (
                <Circle
                  key={idx}
                  center={[customData.lat, customData.long]}
                  radius={zone.radius * 1000}
                  pathOptions={{ color: getZoneColor(key), fillOpacity: 0.3 }}
                >
                  <Popup>
                    <strong>{key}</strong><br/>
                    Radius: {zone.radius} km<br/>
                    Survivability: {zone.survivability}
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </TabPanel>

          {/* Thermal Radiation */}
          <TabPanel>
            <MapContainer
              center={[customData.lat, customData.long]}
              zoom={5}
              style={{ height: '600px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {selectedAsteroid.blastRadiusData?.thermalRadiation && Object.entries(selectedAsteroid.blastRadiusData.thermalRadiation).map(([key, zone], idx) => (
                <Circle
                  key={idx}
                  center={[customData.lat, customData.long]}
                  radius={zone.radius * 1000}
                  pathOptions={{ color: getThermalColor(key), fillOpacity: 0.2 }}
                >
                  <Popup>
                    <strong>{key}</strong><br/>
                    Radius: {zone.radius} km
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </TabPanel>

          {/* Evacuation Zones */}
          <TabPanel>
            <MapContainer
              center={[customData.lat, customData.long]}
              zoom={5}
              style={{ height: '600px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {selectedAsteroid.blastRadiusData?.evacuationZones && Object.entries(selectedAsteroid.blastRadiusData.evacuationZones).map(([zoneName, zone], idx) => (
                <Circle
                  key={idx}
                  center={[customData.lat, customData.long]}
                  radius={zone.radius * 1000}
                  pathOptions={{ color: zone.color || 'blue', fillOpacity: 0.1 }}
                >
                  <Popup>
                    <strong>{zoneName}</strong><br/>
                    Radius: {zone.radius} km<br/>
                    {zone.description}
                  </Popup>
                </Circle>
              ))}
            </MapContainer>
          </TabPanel>
        </Tabs>
      )}

      {/* Impact Calculations Summary */}
      {selectedAsteroid?.primaryApproach?.calculations && (
        <div className="bg-slate-800/70 backdrop-blur-md rounded-lg p-4 mt-6 border border-slate-700 space-y-3">
          <h2 className="text-lg font-semibold flex items-center"><Zap className="w-5 h-5 mr-2"/>Impact Calculations</h2>
          <div className="flex justify-between"><span>Kinetic Energy</span><span>{formatNumber(selectedAsteroid.primaryApproach.calculations.kineticEnergy?.megatons)} MT</span></div>
          <div className="flex justify-between"><span>Estimated Crater Diameter</span><span>{formatNumber(selectedAsteroid.primaryApproach.calculations.estimatedCrater?.diameter)} m</span></div>
          <div className="flex justify-between"><span>Estimated Crater Radius</span><span>{formatNumber(selectedAsteroid.primaryApproach.calculations.estimatedCrater?.radius)} m</span></div>
        </div>
      )}

      {/* Add more summary sections as needed for geographicImpactData, earthquakeData, blastRadiusData */}
    </div>
  );
}
