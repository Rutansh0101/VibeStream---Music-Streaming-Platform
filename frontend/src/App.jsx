import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Player from './components/Player'
import Display from './components/Display'
import { PlayerContext } from './context/PlayerContext'
import { AuthContext } from './context/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import Loader from './components/Loader'

function App() {
  const { audioRef, track } = useContext(PlayerContext);
  const { isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={
          <div className="h-screen bg-black">
            <div className='h-[90%] flex'>
              <Sidebar />
              <Display />
            </div>
            <Player />
          </div>
        } />
      </Route>
      
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App