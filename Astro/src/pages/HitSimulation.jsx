import React, { useState } from 'react';
import HitSimulationView from './HitSimulation';

const ImpactDashboard = () => {
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customData, setCustomData] = useState({ /* form fields */ });
  
  // --- Your function from above
  const submitCustomHit = async () => {
    const API_BASE = 'http://localhost:3000';
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/custom-hit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customData)
      });
  
      if (!response.ok) throw new Error('Failed to submit custom hit');
      const result = await response.json();
  
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
      };
  
      setSelectedAsteroid(customAsteroid);
      setShowCustomForm(false);
      setError(null);
      alert('Custom impact scenario created successfully!');
    } catch (err) {
      setError(err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full h-screen bg-black text-white">
      {loading && <div>Loading impact simulation...</div>}

      {!selectedAsteroid && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">Create Custom Impact</h2>
          {/* Simple form fields */}
          <input
            className="text-black p-2 rounded w-full mb-2"
            placeholder="Impact velocity (km/s)"
            value={customData.velocity || ''}
            onChange={e => setCustomData({ ...customData, velocity: e.target.value })}
          />
          <button
            onClick={submitCustomHit}
            className="bg-red-500 px-4 py-2 rounded text-white font-bold hover:bg-red-600"
          >
            Simulate Impact
          </button>
        </div>
      )}

      {selectedAsteroid && (
        <HitSimulationView data={selectedAsteroid} />
      )}
    </div>
  );
};

export default ImpactDashboard;
