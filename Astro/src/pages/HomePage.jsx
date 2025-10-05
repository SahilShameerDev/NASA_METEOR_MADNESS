  import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Moon from '../components/Moon';

const AsteroidWebsiteDesign = () => {
  const heroRef = useRef(null);
  const astronautRef = useRef(null);
  const earthRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hero = heroRef.current;
    const astronaut = astronautRef.current;
    const earth = earthRef.current;

    if (!hero || !astronaut || !earth) return;

    // Parallax effect
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { offsetWidth, offsetHeight } = hero;
      
      const xPos = (clientX / offsetWidth) - 0.5;
      const yPos = (clientY / offsetHeight) - 0.5;

      const astroStrength = 40;
      const earthStrength = 15;

      const astroX = astroStrength * xPos;
      const astroY = astroStrength * yPos;
      const earthX = earthStrength * xPos;
      const earthY = earthStrength * yPos;

      astronaut.style.transform = `translate(calc(-50% + ${astroX}px), calc(-50% + ${astroY}px)) rotate(-15deg)`;
      earth.style.transform = `translate(calc(-50% + ${earthX}px), ${earthY}px)`;
    };

    hero.addEventListener('mousemove', handleMouseMove);

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Earth click handler with notification
  const handleEarthClick = () => {
    const notification = document.getElementById('notification');
    
    notification.textContent = 'Scanning for active threats...';
    notification.style.opacity = '1';
    notification.style.bottom = '30px';

    setTimeout(() => {
      notification.textContent = 'No threats detected. System clear.';
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.bottom = '10px';
      }, 2000);
    }, 2500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Space Background */}
      <div 
        ref={heroRef}
        className="relative h-screen w-screen flex flex-col justify-center items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >


        {/* Moon 3D Model - Behind text but in front of background */}
        <Moon />

        {/* Main Content */}
        <main className="relative z-20 flex flex-col items-center justify-center text-center px-4" style={{ pointerEvents: 'auto' }}>
          <h2 
            className="leading-none relative"
            style={{
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Arial Black", sans-serif',
              lineHeight: '1.1'
            }}
          >
            PROJECT<br />DOOMSDAY
          </h2>
          <p 
            className="text-lg md:text-xl text-gray-300 mt-2 mb-8 z-10"
            style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.9)' }}
          >
            Explore the infinite.
          </p>
          <button
            onClick={() => navigate("/asteroidplayer")}
            className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-8 py-3 text-sm font-semibold hover:bg-white/20 transition-all duration-300 flex items-center space-x-2 z-10"
          >
            <span>View active threats</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </main>
        

        <img 
          ref={earthRef}
          src="https://assets.stickpng.com/images/580b585b2edbce24c47b270b.png" 
          alt="Planet Earth" 
          className="absolute cursor-pointer transition-transform duration-200 ease-out"
          style={{
            width: '120%',
            maxWidth: '1200px',
            bottom: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1
          }}
          onClick={handleEarthClick}
          onError={(e) => e.target.style.display = 'none'}
        />
        
        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      </div>

      {/* Notification */}
      <div 
        id="notification"
        className="fixed z-50 opacity-0 transition-all duration-500 ease-in-out pointer-events-none"
        style={{
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(5px)',
          color: '#16a34a',
          padding: '12px 24px',
          borderRadius: '9999px',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          fontFamily: "'Courier New', Courier, monospace"
        }}
      ></div>

      {/* Responsive styles for mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          img[alt="Planet Earth"] {
            width: 180% !important;
            bottom: -60% !important;
          }
          img[alt="Astronaut floating in space"] {
            width: 70% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AsteroidWebsiteDesign;