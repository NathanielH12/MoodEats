import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './Components/LandingPage.jsx'
import DashboardPage from './Components/DashboardPage.jsx'
import { RegisterPage } from './Components/RegisterPage.jsx'
import { LoginPage } from './Components/LoginPage.jsx'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSetToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  return (
    <>
      <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />

      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage setToken={handleSetToken} />}
      />

      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage setToken={handleSetToken} />}
      />

      <Route
        path="/dashboard"
        element={token ? <DashboardPage setToken={handleSetToken} /> : <Navigate to="/" replace />}
      />
    </Routes>
    </>
  )
}

export default App
