import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Question from './pages/Question'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Curator from './pages/Curator'
import JoinGroup from './pages/JoinGroup'
import ManageMembers from './pages/ManageMembers'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/question/:id" element={
        <ProtectedRoute>
          <Question />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
<Route path="/curator" element={
  <ProtectedRoute>
    <Curator />
  </ProtectedRoute>
} />
<Route path="/manage-members" element={
  <ProtectedRoute>
    <ManageMembers />
  </ProtectedRoute>
} />
<Route path="/join" element={
  <ProtectedRoute>
    <JoinGroup />
  </ProtectedRoute>
} />
    </Routes>
  )
}