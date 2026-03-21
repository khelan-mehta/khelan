import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import GitHubCallback from './pages/GitHubCallback'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/github/callback" element={<GitHubCallback />} />
    </Routes>
  )
}
