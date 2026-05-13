import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import {Routes, Route } from 'react-router-dom'
import LandingPage from './Components/LandingPage.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </>
  )
}

export default App
