import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AsteroidWebsiteDesign from './pages/HomePage'
import AstroidPlayer from './pages/AstroidDashboard'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AsteroidWebsiteDesign />} />
        <Route path='/asteroidplayer' element={<AstroidPlayer/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
