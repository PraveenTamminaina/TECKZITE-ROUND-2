import React from 'react';
import GameLayout from '../components/GameLayout';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

const Finished = () => {
    const { user } = useGame();

    return (
        <GameLayout>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6 text-center relative overflow-hidden">
                 {/* Background Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mb-10 relative"
                >
                    <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-6xl mx-auto shadow-2xl z-10 relative ring-4 ring-green-500/30">
                        🏆
                    </div>
                    <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
                </motion.div>
                
                <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                    Round 2 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Completed!</span>
                </h1>
                
                <p className="text-slate-400 mb-12 max-w-lg text-lg leading-relaxed">
                    Splendid Performance! Your answers have been locked and submitted securely. 
                    <br />The leaderboard awaits.
                </p>
                
                <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 w-full max-w-2xl shadow-2xl relative overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left relative z-10">
                        <div className="p-8 bg-slate-900/50 rounded-xl border border-slate-800 col-span-2 md:col-span-4 text-center">
                             <p className="text-slate-300 text-lg mb-2">Thank you for participating!</p>
                             <p className="text-slate-500 text-sm">Your submission has been recorded securely by the Admin.</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 text-sm text-slate-500">
                    ID: <span className="font-mono text-slate-300">{user?.teckziteId}</span>
                </div>
            </div>
        </GameLayout>
    );
};

export default Finished;
