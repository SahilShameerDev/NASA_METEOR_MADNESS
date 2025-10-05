import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AsteroidWebsiteDesign from './pages/HomePage'
import AstroidPlayer from './pages/AstroidPlayer'
import Hit from './pages/Hit'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AsteroidWebsiteDesign />} />
        <Route path='/asteroidplayer' element={<AstroidPlayer/>}/>
        <Route path='/hit' element={<Hit/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App