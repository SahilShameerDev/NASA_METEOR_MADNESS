import React, { useState, useEffect, useRef } from 'react';
import { Globe, AlertTriangle, Shield, Target, Activity, MapPin, Droplets, Mountain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AsteroidWebsiteDesign = () => {
  const [activePage, setActivePage] = useState('home');
  const canvasRef = useRef(null);

    const navigate = useNavigate();

  // Animated space background with asteroids
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02
    }));

    // Asteroids
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

      // Draw stars
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

      // Draw and move asteroids
      asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);

        // Draw asteroid shape (irregular polygon)
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

        // Add some craters
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

        // Move asteroid
        asteroid.x += asteroid.speedX;
        asteroid.y += asteroid.speedY;
        asteroid.rotation += asteroid.rotationSpeed;

        // Wrap around screen
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

  const NavBar = () => (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/30 px-8 py-4 relative z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white">AsteroWatch</span>
        </div>
        <div className="flex gap-6">
          {['home', 'probability', 'impact', 'mitigation'].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-4 py-2 rounded-lg transition-all ${activePage === page
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-300 hover:text-cyan-400'
                }`}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-white mb-6">
            Near-Earth Object
            <a className="block text-cyan-400 mt-2" href='/asteroidplayer' >Threat Assessment</a>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Real-time monitoring and analysis of potentially hazardous asteroids approaching Earth
          </p>
          <button
            onClick={() => navigate("/asteroidplayer")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
            View Active Threats
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/70 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500 transition-all">
            <Target className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Hit Probability</h3>
            <p className="text-gray-400">
              Calculate precise impact probabilities using orbital mechanics and trajectory analysis
            </p>
          </div>

          <div className="bg-slate-800/70 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6 hover:border-orange-500 transition-all">
            <MapPin className="w-12 h-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Impact Location</h3>
            <p className="text-gray-400">
              Predict potential impact zones with geographic precision and risk mapping
            </p>
          </div>

          <div className="bg-slate-800/70 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-500 transition-all">
            <Shield className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Mitigation Plans</h3>
            <p className="text-gray-400">
              Explore defense strategies and emergency response protocols
            </p>
          </div>
        </div>

        {/* Current Threat Status */}
        <div className="mt-16 bg-slate-800/70 backdrop-blur-sm border border-yellow-500/50 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Current Threat Level</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-2">Global Status</p>
              <p className="text-3xl font-bold text-yellow-400">ELEVATED</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 mb-2">Objects Tracked</p>
              <p className="text-3xl font-bold text-cyan-400">1,247</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProbabilityPage = () => (
    <div className="min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Impact Probability Analysis</h1>

        {/* Asteroid Info Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-cyan-500/50 rounded-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">Asteroid 2024 QR7</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-gray-400">Diameter:</span>
                  <span className="text-white font-semibold">340 meters</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-gray-400">Velocity:</span>
                  <span className="text-white font-semibold">28.4 km/s</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-gray-400">Discovery Date:</span>
                  <span className="text-white font-semibold">Aug 15, 2024</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-gray-400">Next Close Approach:</span>
                  <span className="text-white font-semibold">Apr 13, 2029</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Impact Probability</h3>
              <div className="relative">
                <div className="w-full bg-slate-700 rounded-full h-12 mb-4">
                  <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-12 rounded-full" style={{ width: '23%' }}></div>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-yellow-400">0.023%</p>
                  <p className="text-gray-400 mt-2">1 in 4,348 chance</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm font-semibold">⚠ MONITORING REQUIRED</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trajectory Timeline */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Trajectory Timeline</h3>
          <div className="space-y-4">
            {[
              { date: '2025', prob: '0.001%', status: 'Safe Pass', color: 'green' },
              { date: '2027', prob: '0.008%', status: 'Close Approach', color: 'yellow' },
              { date: '2029', prob: '0.023%', status: 'Elevated Risk', color: 'orange' },
              { date: '2031', prob: '0.015%', status: 'Monitoring', color: 'yellow' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-slate-900/50 backdrop-blur-sm rounded-lg">
                <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{item.date}</p>
                  <p className="text-gray-400 text-sm">{item.status}</p>
                </div>
                <p className="text-cyan-400 font-bold">{item.prob}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ImpactPage = () => (
    <div className="min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Impact Analysis & Location</h1>

        {/* Map Visualization */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-cyan-500/50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Potential Impact Zones</h2>
          <div className="relative bg-slate-900/70 backdrop-blur-sm rounded-lg p-8 h-96 flex items-center justify-center border border-slate-700">
            <div className="text-center">
              <Globe className="w-32 h-32 text-cyan-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Interactive 3D Globe Visualization</p>
              <p className="text-gray-500 text-sm mt-2">Shows projected impact ellipse and risk zones</p>
            </div>
            {/* Impact zone indicators */}
            <div className="absolute top-8 right-8 bg-red-500/20 border border-red-500 rounded-lg px-4 py-2">
              <p className="text-red-400 font-semibold text-sm">HIGH RISK ZONE</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-900/70 backdrop-blur-sm p-4 rounded-lg border border-red-500/30">
              <p className="text-gray-400 text-sm">Primary Impact Zone</p>
              <p className="text-white font-bold text-lg">Pacific Ocean</p>
              <p className="text-red-400 text-sm">15°N, 142°W</p>
            </div>
            <div className="bg-slate-900/70 backdrop-blur-sm p-4 rounded-lg border border-orange-500/30">
              <p className="text-gray-400 text-sm">Risk Radius</p>
              <p className="text-white font-bold text-lg">800 km</p>
              <p className="text-orange-400 text-sm">Uncertainty Ellipse</p>
            </div>
            <div className="bg-slate-900/70 backdrop-blur-sm p-4 rounded-lg border border-yellow-500/30">
              <p className="text-gray-400 text-sm">Affected Population</p>
              <p className="text-white font-bold text-lg">~2.3M</p>
              <p className="text-yellow-400 text-sm">Coastal Regions</p>
            </div>
          </div>
        </div>

        {/* Impact Effects */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Ocean Impact */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-500/50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Droplets className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">Ocean Impact Effects</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 font-semibold mb-2">Tsunami Generation</p>
                <p className="text-gray-400 text-sm">Wave heights: 15-45 meters</p>
                <p className="text-gray-400 text-sm">Affected coastlines: 3,200 km radius</p>
              </div>
              <div className="p-4 bg-slate-900/70 backdrop-blur-sm rounded-lg">
                <p className="text-white font-semibold mb-2">Energy Release</p>
                <p className="text-gray-400 text-sm">~850 Megatons TNT equivalent</p>
              </div>
              <div className="p-4 bg-slate-900/70 backdrop-blur-sm rounded-lg">
                <p className="text-white font-semibold mb-2">Water Displacement</p>
                <p className="text-gray-400 text-sm">Estimated: 3.2 km³</p>
              </div>
            </div>
          </div>

          {/* Land Impact */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-orange-500/50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mountain className="w-8 h-8 text-orange-400" />
              <h3 className="text-2xl font-bold text-white">Land Impact Effects</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-orange-400 font-semibold mb-2">Crater Formation</p>
                <p className="text-gray-400 text-sm">Diameter: ~6 km</p>
                <p className="text-gray-400 text-sm">Depth: ~900 meters</p>
              </div>
              <div className="p-4 bg-slate-900/70 backdrop-blur-sm rounded-lg">
                <p className="text-white font-semibold mb-2">Seismic Activity</p>
                <p className="text-gray-400 text-sm">Magnitude: 7.8 earthquake equivalent</p>
              </div>
              <div className="p-4 bg-slate-900/70 backdrop-blur-sm rounded-lg">
                <p className="text-white font-semibold mb-2">Atmospheric Effects</p>
                <p className="text-gray-400 text-sm">Dust ejection: Regional climate impact</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MitigationPage = () => (
    <div className="min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Mitigation Strategies</h1>

        {/* Strategy Overview */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-green-500/50 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Planetary Defense Options</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Multiple deflection and mitigation strategies based on threat timeline, asteroid composition, and impact probability
          </p>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Lead Time', value: '4.5 years', color: 'green' },
              { label: 'Mission Readiness', value: '89%', color: 'cyan' },
              { label: 'Success Rate', value: '76%', color: 'blue' },
              { label: 'Budget Required', value: '$4.2B', color: 'purple' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-900/70 backdrop-blur-sm p-4 rounded-lg border border-slate-700 text-center">
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className={`text-${stat.color}-400 text-2xl font-bold`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Deflection Methods */}
        <h2 className="text-2xl font-bold text-white mb-6">Active Deflection Methods</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-cyan-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Kinetic Impactor</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Effectiveness</span>
                <span className="text-white font-semibold">High</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Spacecraft collision to alter asteroid trajectory through momentum transfer
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Mission time: 2-4 years
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Proven technology (DART mission)
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                Requires precise targeting
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm border border-purple-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-purple-400 mb-4">Gravity Tractor</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Effectiveness</span>
                <span className="text-white font-semibold">Moderate</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Spacecraft uses gravitational pull to gradually alter asteroid's path
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Precise control
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                Long mission duration: 5-10 years
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                Requires early detection
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm border border-orange-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-orange-400 mb-4">Nuclear Deflection</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Effectiveness</span>
                <span className="text-white font-semibold">Very High</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Nuclear device detonation near asteroid to vaporize surface material and create thrust
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Most powerful option
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                Political/regulatory challenges
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                Last resort scenario
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm border border-blue-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Ion Beam Deflection</h3>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Effectiveness</span>
                <span className="text-white font-semibold">Moderate</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Focused ion beam to slowly ablate asteroid surface and create propulsive effect
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Continuous, gentle deflection
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                Complex technology
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                Requires 5+ years lead time
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Response */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-red-500/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Emergency Response Protocols</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-900/70 backdrop-blur-sm rounded-lg">
              <p className="text-white font-semibold mb-3">1. Early Warning System</p>
              <p className="text-gray-400 text-sm">Global alert network activation, public notification within 48 hours of impact confirmation</p>
            </div>
            <div className="p-4 bg-slate-900/70 backdrop-blur-sm rounded-lg">
              <p className="text-white font-semibold mb-3">2. Evacuation Planning</p>
              <p className="text-gray-400 text-sm">Coastal and high-risk zone evacuations, emergency shelter preparation, supply distribution</p>
            </div>
            <div className="p-4 bg-slate-900/70 backdrop-blur-sm rounded-lg">
              <p className="text-white font-semibold mb-3">3. International Coordination</p>
              <p className="text-gray-400 text-sm">UN Space Command activation, resource pooling, coordinated response across affected nations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Space Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)' }}
      />

      {/* Content Overlay */}
      <div className="relative z-10">
        <NavBar />
        {activePage === 'home' && <HomePage />}
        {activePage === 'probability' && <ProbabilityPage />}
        {activePage === 'impact' && <ImpactPage />}
        {activePage === 'mitigation' && <MitigationPage />}
      </div>
    </div>
  );
};

export default AsteroidWebsiteDesign;