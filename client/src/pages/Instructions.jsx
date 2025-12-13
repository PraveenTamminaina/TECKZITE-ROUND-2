import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

const Instructions = () => {
    const { user, setUser } = useGame();
    const navigate = useNavigate();
    const [accepted, setAccepted] = useState(false);
    const [starting, setStarting] = useState(false);

    const handleStart = async () => {
        if (!accepted) return;
        setStarting(true);
        try {
            const { data } = await api.post('/game/start');
            setUser(data);
            navigate('/game1');
        } catch (err) {
            console.error("Failed to start", err);
            setStarting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
            >
                <div className="p-8 border-b border-slate-700 bg-slate-800/50">
                    <h1 className="text-3xl font-bold text-blue-400">Competition Rules</h1>
                    <p className="text-slate-400 mt-2">Please read carefully before starting Round 2.</p>
                </div>

                <div className="p-8 space-y-6 bg-slate-900/50">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">🚫 Anti-Cheating Protocols</h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-300">
                            <li><span className="text-red-400 font-bold">Do NOT switch tabs</span> or minimize the window. Doing so will immediately lock your session.</li>
                            <li>Context menu (Right-click) and Copy/Paste are disabled.</li>
                            <li>Keyboard shortcuts (Ctrl+C, Ctrl+T, etc.) are monitored.</li>
                            <li>You get <span className="font-bold text-white">1 Unlock Chance</span> via Admin. The second violation causes permanent disqualification.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">🎮 How to Play</h2>
                        <div className="space-y-4">
                            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                                <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                                    <span className="bg-yellow-500/20 p-1 rounded">1</span> 
                                    Game 1: HTML Treasure Hunt
                                </h3>
                                <p className="text-sm text-slate-300 mb-2">
                                    You will be given riddles describing HTML elements. 
                                    Your task is to guess the correct <span className="font-mono text-white bg-slate-700 px-1 rounded">tagname</span>.
                                </p>
                                <div className="bg-slate-900/50 p-3 rounded text-xs font-mono text-slate-400 border border-slate-700/50">
                                    <span className="text-blue-400">Riddle:</span> "I define a paragraph."<br/>
                                    <span className="text-green-400">Answer:</span> p
                                </div>
                            </div>

                            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                                <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                                    <span className="bg-green-500/20 p-1 rounded">2</span>
                                    Game 2: Flexbox Froggy
                                </h3>
                                <p className="text-sm text-slate-300 mb-2">
                                    Write CSS code to help the frog reach the lilypad.
                                    Use properties like <span className="font-mono text-white bg-slate-700 px-1 rounded">justify-content</span> and <span className="font-mono text-white bg-slate-700 px-1 rounded">align-items</span>.
                                </p>
                                <div className="bg-slate-900/50 p-3 rounded text-xs font-mono text-slate-400 border border-slate-700/50">
                                    <span className="text-purple-400">#pond</span> &#123;<br/>
                                    &nbsp;&nbsp;display: flex;<br/>
                                    &nbsp;&nbsp;<span className="text-white">justify-content: flex-end;</span><br/>
                                    &#125;
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-4 border-t border-slate-700">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500/50 transition"
                            />
                            <span className="text-slate-300 group-hover:text-white transition">
                                I understand that switching tabs will lock my test and may lead to disqualification.
                            </span>
                        </label>
                    </div>
                </div>

                <div className="p-6 bg-slate-800 border-t border-slate-700 flex justify-end">
                    <button
                        onClick={handleStart}
                        disabled={!accepted || starting}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        {starting ? 'Starting...' : 'Start Round 2'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Instructions;
