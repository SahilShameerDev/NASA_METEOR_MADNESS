import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import AstroidDashboard from './AstroDashboard' // Import the renamed component
import HitSimulation from './HitSimulation' // Import the new component

// New component structure for AstroidPlayer
const AstroidPlayer = () => {
  const location = useLocation()
  
  // The base path for this view is '/asteroidplayer'
  const basePath = '/asteroidplayer'

  const tabs = [
    { name: 'Dashboard', path: basePath },
    { name: 'Impact History', path: '/hit' },
  ]
  
  const getTabClasses = (path) => {
    const isActive = location.pathname === path
    return `
      px-6 py-2 text-sm font-medium rounded-t-lg transition-colors
      ${isActive 
        ? 'bg-slate-900/80 text-cyan-400 border-b-2 border-cyan-500' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
      }
    `
  }

  // NOTE: This component is now only responsible for the tab navigation bar.
  // The actual view content is handled by the <Outlet /> in a nested route setup.
  return (
    <div className='relative min-h-screen'>
      {/* Tab Navigation */}
      <div className='fixed top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700'>
        <div className='max-w-7xl mx-auto flex'>
          <Link to='/' className='p-4 text-cyan-400 font-bold'>Zentry Ai</Link>
          <div className='flex items-center ml-8'>
            {tabs.map(tab => (
              <Link key={tab.path} to={tab.path} className={getTabClasses(tab.path)}>
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* The content of the selected route (AstroidDashboard or HitSimulationView) */}
      <div className='pt-16'>
         <Outlet /> {/* This renders the matched nested route component */}
      </div>
      
      {/* NOTE: You should move the canvas background setup into AstroidDashboard or another wrapper 
          if you want it to appear behind both views, or leave it in AstroidDashboard 
          if you only want it there. I'll assume you keep it in AstroidDashboard for now. */}
    </div>
  )
}

export default AstroidPlayer
