import React from 'react'
import { Outlet } from 'react-router-dom'

// Simplified component structure for AstroidPlayer
const AstroidPlayer = () => {
  // NOTE: This component now just renders the content without top navigation
  // The navigation will be handled within the individual components
  return (
    <div className='relative min-h-screen'>
      {/* The content of the selected route (AstroidDashboard or HitSimulationView) */}
      <Outlet /> {/* This renders the matched nested route component */}
    </div>
  )
}

export default AstroidPlayer

