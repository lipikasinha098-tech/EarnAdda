import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Spin } from './pages/Spin';
import { Scratch } from './pages/Scratch';
import { Tasks } from './pages/Tasks';
import { Leaderboard } from './pages/Leaderboard';
import { Withdraw } from './pages/Withdraw';
import { Profile } from './pages/Profile';
import { RainingBackground } from './components/RainingBackground';

export default function App() {
  return (
    <AuthProvider>
      <div className="fixed inset-0 bg-[#020512] -z-20" />
      <RainingBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/spin" element={<Spin />} />
              <Route path="/scratch" element={<Scratch />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/withdraw" element={<Withdraw />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
