import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AsteroidWebsiteDesign from './pages/HomePage'
// Import the new components for the tabbed interface
import AstroidPlayer from './pages/AstroidPlayer'      // This component will contain the Tabs (Navigation Bar)
import AstroidDashboard from './pages/AstroDashboard' // This contains your original massive component logic/view
import ImpactDashboard from './pages/HitSimulation'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: The Homepage */}
        <Route path="/" element={<AsteroidWebsiteDesign />} />
        
        {/* Route 2: The Tabbed View (Parent Route) */}
        {/* When you hit /asteroidplayer, AstroidPlayer renders the tabs. */}
        <Route path='/asteroidplayer' element={<AstroidPlayer/>}>
          
          {/* Nested Route 1 (Default): The Dashboard Tab */}
          {/* This renders AstroidDashboard when the path is exactly /asteroidplayer */}
          <Route index element={<AstroidDashboard />} />
          
          {/* Nested Route 2: The Impact History Tab */}
          {/* The path becomes /asteroidplayer/hit */}
          {/* NOTE: I replaced your placeholder <H/> with the proper component */}
          {/* <Route path='/hit' element={<ImpactDashboard/>}/> */}
          
        </Route>
        
        {/* If you want a top-level route for hit, you can add it, but this nested approach is better for tabs */}
        <Route path='/hit' element={<ImpactDashboard/>}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App