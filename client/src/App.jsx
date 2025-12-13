import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import Login from './pages/Login';
import LockScreen from './components/LockScreen';
import Instructions from './pages/Instructions';
import Game1 from './pages/Game1';
import Game2 from './pages/Game2';
import Finished from './pages/Finished';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

const ProtectedRoute = ({ children, requireAuth = true }) => {
    const { user, loading } = useGame();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;

    if (requireAuth && !user) {
        return <Navigate to="/login" />;
    }

    if (!requireAuth && user) {
        // Redirect based on state if already logged in
        if (user.status === 'completed') return <Navigate to="/finished" />;
        if (user.currentRound === 'instructions') return <Navigate to="/instructions" />;
        if (user.currentRound === 'game1') return <Navigate to="/game1" />;
        if (user.currentRound === 'game2') return <Navigate to="/game2" />;
        return <Navigate to="/instructions" />;
    }

    return children;
};

function AppContent() {
    return (
        <div className="min-h-screen w-full bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-hidden">
            <LockScreen />
            <Routes>
                <Route path="/login" element={<ProtectedRoute requireAuth={false}><Login /></ProtectedRoute>} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                <Route path="/instructions" element={<ProtectedRoute><Instructions /></ProtectedRoute>} />
                <Route path="/game1" element={<ProtectedRoute><Game1 /></ProtectedRoute>} />
                <Route path="/game2" element={<ProtectedRoute><Game2 /></ProtectedRoute>} />
                <Route path="/finished" element={<ProtectedRoute><Finished /></ProtectedRoute>} />
                
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </div>
    );
}

function App() {
  return (
    <Router>
        <GameProvider>
            <AppContent />
        </GameProvider>
    </Router>
  );
}

export default App;
