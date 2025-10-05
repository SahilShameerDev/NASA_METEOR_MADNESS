import { useState, useEffect, useRef } from "react";

export default function AsteroidImpact() {
  const [distance, setDistance] = useState(1000);
  const [velocity, setVelocity] = useState(20);
  const [mass, setMass] = useState(1000);
  const [orbitalSpeed, setOrbitalSpeed] = useState(50);
  const [running, setRunning] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(1000);
  const [angle, setAngle] = useState(0);
  const requestRef = useRef();

  const kineticEnergy = 0.5 * mass * velocity * velocity;
  const tntEquivalent = (kineticEnergy / 4.184e9).toFixed(2);

  useEffect(() => {
    if (!running) return;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setCurrentDistance((d) => {
        const newD = d - velocity * delta;
        if (newD <= 0) {
          setRunning(false);
          setExploded(true);
          return 0;
        }
        return newD;
      });

      // Update rotation angle
      setAngle((a) => (a + orbitalSpeed * delta) % 360);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [running, velocity, orbitalSpeed]);

  const handleStart = () => {
    setExploded(false);
    setCurrentDistance(distance);
    setAngle(0);
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setExploded(false);
    setCurrentDistance(distance);
    setAngle(0);
  };

  // Calculate orbital position
  const earthCenterX = 50; // percentage
  const earthCenterY = 75; // percentage from top
  const orbitRadius = Math.min(currentDistance / 10, 40); // percentage units
  
  const asteroidX = earthCenterX + orbitRadius * Math.cos((angle * Math.PI) / 180);
  const asteroidY = earthCenterY + orbitRadius * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-100 p-8 overflow-hidden relative">
      {/* Unreal Engine style grid background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)'
      }} />

      <div className="max-w-6xl w-full relative z-10">
        {/* Unreal Engine style header */}
        <div className="mb-8 border-l-4 border-cyan-400 pl-4">
          <h1 className="text-5xl font-bold mb-1 text-cyan-400 tracking-wider" style={{
            textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
          }}>
            ASTEROID IMPACT SIMULATOR
          </h1>
          <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">
            Orbital Mechanics • Unreal Engine Physics Simulation
          </p>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 p-4 border border-gray-800 relative overflow-hidden group hover:border-cyan-400 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
            <label className="block text-xs font-mono mb-2 text-cyan-400 uppercase tracking-wider">
              Mass (kg)
            </label>
            <input
              type="number"
              value={mass}
              onChange={(e) => setMass(Math.max(1, Number(e.target.value)))}
              disabled={running}
              className="w-full bg-black text-cyan-300 px-3 py-2 font-mono border border-gray-800 focus:border-cyan-400 focus:outline-none disabled:opacity-50 transition-all"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-cyan-400 opacity-30" />
          </div>

          <div className="bg-gray-900 p-4 border border-gray-800 relative overflow-hidden group hover:border-cyan-400 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
            <label className="block text-xs font-mono mb-2 text-cyan-400 uppercase tracking-wider">
              Velocity (km/s)
            </label>
            <input
              type="number"
              value={velocity}
              onChange={(e) => setVelocity(Math.max(1, Number(e.target.value)))}
              disabled={running}
              className="w-full bg-black text-cyan-300 px-3 py-2 font-mono border border-gray-800 focus:border-cyan-400 focus:outline-none disabled:opacity-50 transition-all"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-cyan-400 opacity-30" />
          </div>

          <div className="bg-gray-900 p-4 border border-gray-800 relative overflow-hidden group hover:border-cyan-400 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
            <label className="block text-xs font-mono mb-2 text-cyan-400 uppercase tracking-wider">
              Distance (km)
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => {
                const newDist = Math.max(1, Number(e.target.value));
                setDistance(newDist);
                if (!running) setCurrentDistance(newDist);
              }}
              disabled={running}
              className="w-full bg-black text-cyan-300 px-3 py-2 font-mono border border-gray-800 focus:border-cyan-400 focus:outline-none disabled:opacity-50 transition-all"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-cyan-400 opacity-30" />
          </div>

          <div className="bg-gray-900 p-4 border border-gray-800 relative overflow-hidden group hover:border-cyan-400 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
            <label className="block text-xs font-mono mb-2 text-cyan-400 uppercase tracking-wider">
              Orbital Speed (°/s)
            </label>
            <input
              type="number"
              value={orbitalSpeed}
              onChange={(e) => setOrbitalSpeed(Math.max(0, Number(e.target.value)))}
              disabled={running}
              className="w-full bg-black text-cyan-300 px-3 py-2 font-mono border border-gray-800 focus:border-cyan-400 focus:outline-none disabled:opacity-50 transition-all"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-cyan-400 opacity-30" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={handleStart}
            disabled={running}
            className="relative px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 font-mono uppercase tracking-wider text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group hover:shadow-cyan-500/50 hover:shadow-lg transition-all"
          >
            <span className="relative z-10">{running ? "RUNNING..." : "START SIMULATION"}</span>
            <div className="absolute inset-0 bg-cyan-300 opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>
          <button
            onClick={handleReset}
            className="relative px-8 py-3 bg-gray-900 border border-gray-700 font-mono uppercase tracking-wider text-sm font-bold overflow-hidden group hover:border-cyan-400 transition-all"
          >
            <span className="relative z-10">RESET</span>
          </button>
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-orange-500 opacity-30" />
            <p className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Kinetic Energy</p>
            <p className="text-xl font-bold font-mono text-orange-400">{kineticEnergy.toExponential(2)} J</p>
            <div className="mt-2 h-1 bg-gray-800">
              <div className="h-full bg-gradient-to-r from-orange-600 to-red-600" style={{width: '75%'}} />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-yellow-500 opacity-30" />
            <p className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">TNT Equivalent</p>
            <p className="text-xl font-bold font-mono text-yellow-400">{tntEquivalent} tons</p>
            <div className="mt-2 h-1 bg-gray-800">
              <div className="h-full bg-gradient-to-r from-yellow-600 to-orange-600" style={{width: '60%'}} />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-cyan-500 opacity-30" />
            <p className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Distance</p>
            <p className="text-xl font-bold font-mono text-cyan-400">{currentDistance.toFixed(1)} km</p>
            <div className="mt-2 h-1 bg-gray-800">
              <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-600" style={{width: `${(currentDistance/distance)*100}%`}} />
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-purple-500 opacity-30" />
            <p className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Orbital Angle</p>
            <p className="text-xl font-bold font-mono text-purple-400">{angle.toFixed(1)}°</p>
            <div className="mt-2 h-1 bg-gray-800">
              <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{width: `${(angle/360)*100}%`}} />
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div className="relative w-full h-96 bg-black border border-gray-800 overflow-hidden" style={{
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
        }}>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }} />

          {/* Viewport corners */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

          {/* Stars */}
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-cyan-300 rounded-full"
                style={{
                  width: Math.random() * 2 + 0.5,
                  height: Math.random() * 2 + 0.5,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                  boxShadow: `0 0 ${Math.random() * 4}px rgba(0, 255, 255, 0.8)`
                }}
              />
            ))}
          </div>

          {/* Orbital path visualization */}
          {!exploded && (
            <div
              className="absolute border border-cyan-600 rounded-full"
              style={{
                width: `${orbitRadius * 2}%`,
                height: `${orbitRadius * 2}%`,
                left: `${earthCenterX}%`,
                top: `${earthCenterY}%`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.3,
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
              }}
            />
          )}

          {/* Earth */}
          <div
            className="absolute"
            style={{
              width: 120,
              height: 120,
              left: `${earthCenterX}%`,
              top: `${earthCenterY}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" style={{
              boxShadow: '0 0 60px rgba(59, 130, 246, 0.6), inset 0 0 40px rgba(0, 0, 0, 0.5)'
            }}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-500 to-transparent opacity-40" />
              <div className="absolute inset-0 rounded-full" style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)'
              }} />
            </div>
          </div>

          {/* Asteroid in orbit */}
          {!exploded && (
            <div
              className="absolute"
              style={{
                width: 40,
                height: 40,
                left: `${asteroidX}%`,
                top: `${asteroidY}%`,
                transform: "translate(-50%, -50%)",
                transition: running ? 'none' : 'all 0.3s ease-out'
              }}
            >
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900" style={{
                boxShadow: '0 0 30px rgba(255, 100, 0, 0.6), inset -10px -10px 20px rgba(0, 0, 0, 0.8)'
              }}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-600 to-transparent opacity-40" />
                {/* Motion trail */}
                {running && (
                  <div 
                    className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-transparent opacity-60"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                      transformOrigin: 'center'
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Explosion */}
          {exploded && (
            <>
              <div
                className="absolute"
                style={{
                  width: 300,
                  height: 300,
                  left: `${earthCenterX}%`,
                  top: `${earthCenterY}%`,
                  transform: "translate(-50%, -50%)",
                  background: 'radial-gradient(circle, rgba(255,255,100,1) 0%, rgba(255,150,0,0.8) 20%, rgba(255,50,0,0.4) 50%, transparent 100%)',
                  animation: 'explosion 2s ease-out forwards',
                  filter: 'blur(2px)',
                  boxShadow: '0 0 100px rgba(255, 200, 0, 0.8)'
                }}
              />
              <div
                className="absolute"
                style={{
                  width: 200,
                  height: 200,
                  left: `${earthCenterX}%`,
                  top: `${earthCenterY}%`,
                  transform: "translate(-50%, -50%)",
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,100,0.8) 30%, rgba(255,150,0,0.4) 60%, transparent 100%)',
                  animation: 'explosion 1.5s ease-out forwards',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 80px rgba(255, 255, 255, 0.9)'
                }}
              />
              {/* Screen flash */}
              <div className="absolute inset-0 bg-white" style={{
                animation: 'flash 0.5s ease-out'
              }} />
            </>
          )}

          {/* HUD Info */}
          <div className="absolute top-4 left-4 font-mono text-xs space-y-1">
            <div className="text-cyan-400">// VIEWPORT STATUS</div>
            <div className="text-gray-500">FPS: 60 | LOD: HIGH</div>
            <div className="text-gray-500">RENDER: REALTIME</div>
            <div className="text-gray-500">MODE: ORBITAL</div>
          </div>

          {/* Trajectory indicator */}
          {running && !exploded && (
            <div className="absolute top-4 right-4 font-mono text-xs">
              <div className="text-yellow-400 animate-pulse">⚠ COLLISION COURSE</div>
              <div className="text-gray-500">T-{(currentDistance / velocity).toFixed(1)}s</div>
            </div>
          )}

          {/* Impact Alert */}
          {exploded && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="relative">
                <div className="text-6xl font-bold font-mono text-red-500 animate-pulse" style={{
                  textShadow: '0 0 20px rgba(255, 0, 0, 0.8)'
                }}>
                  [IMPACT]
                </div>
                <div className="mt-2 text-xl font-mono text-yellow-400">
                  CRITICAL DAMAGE DETECTED
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Status */}
        {exploded && (
          <div className="mt-6 bg-red-950 border border-red-800 p-4 font-mono">
            <div className="flex items-start gap-3">
              <div className="text-red-500 text-2xl">⚠</div>
              <div>
                <div className="text-red-400 font-bold uppercase text-sm mb-1">System Alert</div>
                <div className="text-gray-300 text-sm">
                  Asteroid impact detected at {angle.toFixed(1)}° orbital position with {tntEquivalent} tons TNT equivalent energy release. 
                  Catastrophic surface damage predicted.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes explosion {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        @keyframes flash {
          0% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}