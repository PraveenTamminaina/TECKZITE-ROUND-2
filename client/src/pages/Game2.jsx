import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameLayout from '../components/GameLayout';
import api from '../utils/api';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

const LEVELS = [
    {
        id: 1,
        instruction: "Welcome to Flexbox Froggy! Help the frog get to the lilypad on the right by using the `justify-content` property.",
        defaultCss: "#pond {\n  display: flex;\n  \n}",
        validRegex: /justify-content\s*:\s*flex-end/i,
        pondStyle: {},
        frogCount: 1,
        lilypadStyle: { justifyContent: 'flex-end' } // Visual reference
    },
    {
        id: 2,
        instruction: "Help the frog reach the center of the pond.",
        defaultCss: "#pond {\n  display: flex;\n  \n}",
        validRegex: /justify-content\s*:\s*center/i,
        pondStyle: {},
        frogCount: 1,
        lilypadStyle: { justifyContent: 'center' }
    },
    {
        id: 3,
        instruction: "Help the two frogs find their lilypads. Space them around.",
        defaultCss: "#pond {\n  display: flex;\n  \n}",
        validRegex: /justify-content\s*:\s*space-around/i,
        pondStyle: {},
        frogCount: 2,
        lilypadStyle: { justifyContent: 'space-around' }
    },
    {
        id: 4,
        instruction: "Now space the frogs with `space-between`.",
        defaultCss: "#pond {\n  display: flex;\n  \n}",
        validRegex: /justify-content\s*:\s*space-between/i,
        pondStyle: {},
        frogCount: 3,
        lilypadStyle: { justifyContent: 'space-between' }
    },
    {
        id: 5,
        instruction: "Use `align-items` to move the frog to the bottom.",
        defaultCss: "#pond {\n  display: flex;\n  \n}",
        validRegex: /align-items\s*:\s*flex-end/i,
        pondStyle: { alignItems: 'flex-end' }, // this is cheat sheet essentially
        frogCount: 1,
        lilypadStyle: { alignItems: 'flex-end' } 
    },
    // Add more levels as needed
];

    const Game2 = () => {
    const { user, syncState } = useGame();
    const navigate = useNavigate();
    
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { 1: "#pond { ... }" }
    const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishGame2();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Load State
    useEffect(() => {
        if (user && user.game2State && user.game2State.answers) {
            const initialAnswers = {};
            user.game2State.answers.forEach(a => {
                initialAnswers[a.levelId] = a.userCss;
            });
            setAnswers(initialAnswers);
        }
    }, []);

    const level = LEVELS[currentLevelIndex];
    const userCss = answers[level.id] || level.defaultCss;

    const handleCssChange = (val) => {
        setAnswers(prev => ({ ...prev, [level.id]: val }));
    };

    const saveCurrentLevel = async () => {
        // Validation Logic
        const cleanCss = userCss.replace(/\/\*[\s\S]*?\*\//g, '');
        const isCorrect = level.validRegex.test(cleanCss);

        try {
            await api.post('/game/submit/flexbox', {
                level: level.id,
                userCss,
                isCorrect
            });
        } catch (err) {
            console.error("Save error", err);
        }
    };

    const handleNext = async () => {
        await saveCurrentLevel();
        if (currentLevelIndex < LEVELS.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
        }
    };

    const handlePrev = async () => {
        await saveCurrentLevel();
        if (currentLevelIndex > 0) {
            setCurrentLevelIndex(prev => prev - 1);
        }
    };

    const handleJump = async (index) => {
        await saveCurrentLevel();
        setCurrentLevelIndex(index);
    };

    const finishGame2 = async () => {
        await saveCurrentLevel(); // Save current
        if (!window.confirm("Submit Flexbox Froggy and Finish Round 2?")) return;

        try {
            await api.post('/game/finish');
            // window.location.href = '/finished';
            navigate('/finished');
        } catch (err) {
            console.error(err);
             alert('Finish Failed: ' + (err.response?.data?.message || err.message || 'Server Error'));
        }
    };

    // Preview Logic
    const cssContent = userCss.substring(userCss.indexOf('{') + 1, userCss.lastIndexOf('}'));
    const previewContainerClass = `preview-pond-${level.id}`;

    return (
        <GameLayout>
             <style>{`
                .${previewContainerClass} {
                    ${cssContent}
                }
            `}</style>
            
            <div className="flex flex-col md:flex-row h-full overflow-hidden">
                {/* Left: Editor */}
                <div className="w-full md:w-1/3 bg-slate-800 border-r border-slate-700 flex flex-col shadow-2xl relative z-10">
                    <div className="p-6 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                <span className="bg-green-500/20 p-1.5 rounded-lg text-lg">🐸</span> 
                                Level {level.id}
                            </h2>
                            <div className="flex items-center gap-4">
                                <span className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                    {currentLevelIndex + 1} / {LEVELS.length}
                                </span>
                            </div>
                        </div>

                        {/* Navigation Grid */}
                        <div className="flex gap-1 mb-4">
                            {LEVELS.map((l, idx) => (
                                <button
                                    key={l.id}
                                    onClick={() => handleJump(idx)}
                                    className={`h-8 w-8 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                                        idx === currentLevelIndex 
                                            ? 'bg-green-600 text-white shadow-lg' 
                                            : answers[l.id] // If modified? Or simple check if exists
                                                ? 'bg-slate-700 text-green-400 border border-green-500/30'
                                                : 'bg-slate-900 text-slate-600 hover:bg-slate-700'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed font-light">
                            {level.instruction}
                        </p>
                    </div>
                    
                    <div className="flex-1 p-0 bg-[#1e1e1e] font-mono relative group overflow-hidden">
                        {/* Line numbers (fake) */}
                        <div className="absolute left-0 top-6 bottom-0 w-10 text-right pr-3 text-slate-600 text-sm leading-6 select-none border-r border-slate-700/30 bg-[#1e1e1e] z-10">
                            {Array.from({length: 15}).map((_, i) => <div key={i}>{i+1}</div>)}
                        </div>
                        
                        <div className="absolute inset-0 pl-12 pt-6 pointer-events-none text-slate-500 text-sm leading-6 z-0">
                            <div>#pond &#123;</div>
                            <div>&nbsp;&nbsp;display: flex;</div>
                            <div className="text-transparent selection:text-transparent">user typed here</div>
                            <div>&#125;</div>
                        </div>

                        <textarea
                            value={userCss}
                            onChange={(e) => handleCssChange(e.target.value)}
                            className="absolute top-0 left-0 w-full h-full bg-transparent text-yellow-300 pl-16 pt-[3.0rem] focus:outline-none resize-none leading-6 z-20 font-mono text-sm caret-yellow-500"
                            spellCheck="false"
                            autoFocus
                        />
                    </div>
                    
                    <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
                         <button 
                            onClick={handlePrev}
                            disabled={currentLevelIndex === 0}
                            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                        >
                            &lt; Prev
                        </button>
                        
                        {currentLevelIndex === LEVELS.length - 1 ? (
                            <button
                                onClick={finishGame2}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all aniamte-pulse"
                            >
                                Finish Game
                            </button>
                        ) : (
                             <button 
                                onClick={handleNext}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                            >
                                Next &gt;
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Preview (Pond) */}
                <div className="flex-1 bg-slate-900 relative flex flex-col items-center justify-center p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none"></div>
                    
                    {/* Pond Container */}
                    <div className="relative w-full max-w-4xl h-[600px] bg-blue-900/20 rounded-3xl border-4 border-blue-500/30 shadow-inner overflow-hidden backdrop-blur-sm">
                         {/* Background Layer (Lilypads) */}
                        <div className="absolute inset-0 p-8 flex gap-4 transition-all duration-500" style={{...level.lilypadStyle, display: 'flex'}}> 
                            {Array.from({length: level.frogCount}).map((_, i) => (
                                <div key={`pad-${i}`} className="w-24 h-24 bg-green-800/40 rounded-full border-4 border-green-700/40 flex items-center justify-center relative">
                                    <span className="text-4xl opacity-40 drop-shadow-lg">🍃</span>
                                </div>
                            ))}
                        </div>

                        {/* Foreground Layer (Frogs - User controlled) */}
                        <div className={`absolute inset-0 p-8 flex gap-4 z-10 transition-all duration-500 ease-out ${previewContainerClass}`}>
                            {Array.from({length: level.frogCount}).map((_, i) => (
                                <div key={`frog-${i}`} className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-b-4 border-green-700 relative animate-bounce-slow">
                                    <span className="text-5xl absolute -top-2 drop-shadow-md">🐸</span>
                                    <div className="absolute bottom-0 w-full h-2 bg-black/20 rounded-full blur-sm translate-y-2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <p className="mt-4 text-slate-500 text-sm font-mono flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500/50 rounded-full animate-pulse"></span>
                        Live Preview
                    </p>
                </div>
            </div>
        </GameLayout>
    );
};

export default Game2;
