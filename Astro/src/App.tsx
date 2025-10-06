import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AsteroidWebsiteDesign from './pages/HomePage'
// import AstroidPlayer from './pages/AstroidPlayer'      // This component will contain the Tabs (Navigation Bar)
import AstroidPlayer from './pages/AstroDashboard' // This contains your original massive component logic/view
import ImpactDashboard from './pages/HitSimulation'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: The Homepage */}
        <Route path="/" element={<AsteroidWebsiteDesign />} />
        
        {/* Route 2: The Tabbed View (Parent Route) */}
        {/* When you hit /asteroidplayer, AstroidPlayer renders the tabs. */}
        <Route path='/asteroidplayer' element={<AstroidPlayer/>}/>
        
        {/* If you want a top-level route for hit, you can add it, but this nested approach is better for tabs */}
        <Route path='/hit' element={<ImpactDashboard/>}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App
