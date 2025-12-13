import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import useAntiCheat from '../hooks/useAntiCheat';

const GameLayout = ({ children, title }) => {
    const { user, logout } = useGame();
    // useAntiCheat(); // DISABLED: Anti-cheat temporarily disabled per user request

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate time remaining based on startTime + 20 mins for Game 1?
    // Or just show elapsed?
    // Requirement: "Game 1: ... Timer 20 minutes ... Auto-submit".
    // We need a countdown.
    
    // For simplicity in layout, just show User info and Score.
    // Specific timer logic might be inside the Game component or here if global.
    // Let's keep it simple here.

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg">
                        TZ
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{user?.name || user?.teckziteId}</h1>
                        <p className="text-xs text-slate-400">ID: {user?.teckziteId}</p>
                    </div>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div className="bg-slate-900 px-6 py-2 rounded-full border border-slate-700 flex items-center space-x-6">
                        <div className="text-center">
                            <span className="block text-xs text-slate-500 uppercase font-bold">Score</span>
                            <span className="text-xl font-mono font-bold text-green-400">{user?.scores?.total || 0}</span>
                        </div>
                        {/* Timer could go here if global */}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-right">
                         <span className="block text-xs text-slate-500 uppercase font-bold">Status</span>
                         <span className="text-sm font-semibold capitalize text-blue-400">{user?.currentRound}</span>
                    </div>
                    <button 
                        onClick={logout}
                        className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                        title="Logout (Warning: Session continues)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                 {children}
            </main>
        </div>
    );
};

export default GameLayout;
