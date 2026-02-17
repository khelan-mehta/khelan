import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Admin from './pages/Admin'
import CustomCursor from './components/CustomCursor'

function App() {
  return (
    <>
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}

export default App
