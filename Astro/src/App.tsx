import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import AsteroidWebsiteDesign from './pages/HomePage'
import AstroidPlayer from './pages/AstroidPlayer'

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