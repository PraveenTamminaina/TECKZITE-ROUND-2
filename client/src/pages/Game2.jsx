import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameLayout from '../components/GameLayout';
import api from '../utils/api';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const LEVELS = [
    {
        id: 1,
        instruction: "Welcome to Flexbox Froggy! A frog is lost. Use justify-content to move it to the lilypad on the right.",
        hint: "values: flex-start, flex-end, center, space-between, space-around",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        expectedCss: "justify-content",
        regex: /justify-content\s*:\s*flex-end/,
        frogs: 1,
        lilypadStyle: { justifyContent: 'flex-end' },
        frogColor: 'green'
    },
    {
        id: 2,
        instruction: "Use justify-content again to help these frogs get to their lilypads in the center.",
        hint: "Center them.",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        expectedCss: "justify-content",
        regex: /justify-content\s*:\s*center/,
        frogs: 2,
        lilypadStyle: { justifyContent: 'center' },
        frogColor: 'green'
    },
    {
        id: 3,
        instruction: "Help all three frogs find their lilypads by spacing them around.",
        hint: "Space around.",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        expectedCss: "justify-content",
        regex: /justify-content\s*:\s*space-around/,
        frogs: 3,
        lilypadStyle: { justifyContent: 'space-around' },
        frogColor: 'green'
    },
    {
        id: 4,
        instruction: "Now the lilypads on the edges have drifted to the shore. Space them between.",
        hint: "Space between.",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        expectedCss: "justify-content",
        regex: /justify-content\s*:\s*space-between/,
        frogs: 3,
        lilypadStyle: { justifyContent: 'space-between' },
        frogColor: 'green'
    },
    {
        id: 5,
        instruction: "Now use align-items to help the frogs get to the bottom of the pond.",
        hint: "values: flex-start, flex-end, center, baseline, stretch",
        initialCss: "#pond {\n  display: flex;\n  align-items: flex-start;\n  /* Your code here */\n\n}",
        expectedCss: "align-items",
        regex: /align-items\s*:\s*flex-end/,
        frogs: 1,
        lilypadStyle: { alignItems: 'flex-end', justifyContent: 'flex-start' }, 
        frogColor: 'green'
    },
    {
        id: 6,
        instruction: "Lead the frog to the center of the pond using a combination of justify-content and align-items.",
        hint: "Center horizontally and vertically.",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        regex: /justify-content\s*:\s*center[\s\S]*align-items\s*:\s*center|align-items\s*:\s*center[\s\S]*justify-content\s*:\s*center/,
        frogs: 1,
        lilypadStyle: { justifyContent: 'center', alignItems: 'center' },
        frogColor: 'green'
    },
    {
        id: 7,
        instruction: "The frogs need to cross the pond. This time, there's plenty of space around them. Use flex-direction.",
        hint: "values: row, row-reverse, column, column-reverse",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        regex: /flex-direction\s*:\s*row-reverse/,
        frogs: 3,
        lilypadStyle: { flexDirection: 'row-reverse', justifyContent: 'flex-start' }, 
        frogColor: 'green',
        styleOverride: { flexDirection: 'row-reverse' } 
    },
    {
        id: 8,
        instruction: "Help the frogs find their column of lilypads using flex-direction.",
        hint: "Think vertically.",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        regex: /flex-direction\s*:\s*column/,
        frogs: 3,
        lilypadStyle: { flexDirection: 'column', alignItems: 'flex-start' },
        frogColor: 'green'
    },
    {
        id: 9,
        instruction: "The frogs are all squeezed onto a single row of lilypads. Spread them out using flex-wrap.",
        hint: "wrap or wrap-reverse",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        regex: /flex-wrap\s*:\s*wrap/,
        frogs: 7, 
        lilypadStyle: { flexWrap: 'wrap' },
        frogColor: 'green'
    },
    {
        id: 10,
        instruction: "Everything is backwards! Use flex-flow to fix it.",
        hint: "flex-flow is a shorthand for flex-direction and flex-wrap.",
        initialCss: "#pond {\n  display: flex;\n  /* Your code here */\n\n}",
        regex: /flex-flow\s*:\s*column-reverse\s*wrap-reverse/,
        frogs: 5,
        lilypadStyle: { flexFlow: 'column-reverse wrap-reverse' },
        frogColor: 'green'
    }
];

const Game2 = () => {
    const { user, setUser } = useGame();
    const navigate = useNavigate();

    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    // Store answers for ALL levels here: { 1: "css", 2: "css" }
    const [answers, setAnswers] = useState({});
    // Store completion status: { 1: true, 2: false }
    const [completed, setCompleted] = useState({});
    
    // Derived current CSS
    const currentLevel = LEVELS[currentLevelIndex];
    const css = answers[currentLevel.id] !== undefined ? answers[currentLevel.id] : currentLevel.initialCss;

    const [timeLeft, setTimeLeft] = useState(1200); 

    // Timer logic 
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const updateCss = (newCss) => {
        setAnswers(prev => ({ ...prev, [currentLevel.id]: newCss }));
    };

    const checkAnswer = async () => {
        const passed = currentLevel.regex.test(css);
        if (passed) {
             setCompleted(prev => ({ ...prev, [currentLevel.id]: true }));
             
             // Submit score silently
             try {
                const { data } = await api.post('/game/submit/flexbox', {
                    level: currentLevel.id,
                    userCss: css,
                    isCorrect: true 
                });
                if (data.scores) {
                    setUser(prev => ({ ...prev, scores: data.scores }));
                }
            } catch(e) { console.error(e); }
            
            // Visual feedback
             // Alert removed
        } else {
            alert("Not quite! Try again.");
        }
    };

    const handleNext = () => {
        if (currentLevelIndex < LEVELS.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
        }
    };
    
    const handlePrev = () => {
        if (currentLevelIndex > 0) {
            setCurrentLevelIndex(prev => prev - 1);
        }
    };

    const finishGame = async () => {
        if (!window.confirm("Finish Phase 2?")) return;
        try {
            await api.post('/game/finish'); 
            navigate('/finished');
        } catch(e) { console.error(e); }
    };
    
    return (
        <GameLayout>
            <div className="max-w-[1600px] mx-auto p-4 flex flex-col h-[calc(100vh-80px)]">
                {/* Header */}
                 <div className="flex justify-between items-center mb-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                                🐸 Flexbox Froggy
                            </h1>
                            <p className="text-slate-400 text-sm">Level {currentLevel.id} of {LEVELS.length}</p>
                        </div>
                        {/* Level Navigator */}
                        <div className="flex gap-1">
                            {LEVELS.map((lvl, idx) => (
                                <button
                                    key={lvl.id}
                                    onClick={() => setCurrentLevelIndex(idx)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                        idx === currentLevelIndex 
                                            ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                                            : completed[lvl.id]
                                                ? 'bg-green-600/50 text-green-200 border border-green-500/50'
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    }`}
                                >
                                    {lvl.id}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="text-2xl font-mono font-bold text-blue-400">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Left: Instructions & Editor */}
                    <div className="w-1/3 flex flex-col gap-4 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                         <div className="p-6 bg-slate-800 border-b border-slate-700">
                             <div className="flex justify-between items-start">
                                 <p className="text-lg text-white mb-4 leading-relaxed flex-1">{currentLevel.instruction}</p>
                                 {completed[currentLevel.id] && <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-bold">SOLVED</span>}
                             </div>
                             <div className="flex items-start gap-2 text-yellow-500/90 bg-yellow-500/10 p-3 rounded-lg text-sm">
                                 <span>💡</span>
                                 <p>{currentLevel.hint}</p>
                             </div>
                         </div>
                         
                         <div className="flex-1 relative bg-[#1e1e1e] flex flex-col">
                             <div className="bg-[#2d2d2d] px-4 py-1 text-xs text-slate-400 select-none">CSS Editor</div>
                             <textarea
                                value={css}
                                onChange={(e) => updateCss(e.target.value)}
                                className="flex-1 bg-transparent text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none"
                                spellCheck="false"
                            />
                         </div>
                         
                         <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-4">
                             <div className="flex gap-2">
                                <button 
                                    onClick={handlePrev}
                                    disabled={currentLevelIndex === 0}
                                    className="px-4 py-3 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600"
                                >
                                    ◀
                                </button>
                                <button 
                                    onClick={handleNext}
                                    disabled={currentLevelIndex === LEVELS.length - 1}
                                    className="px-4 py-3 bg-slate-700 text-white rounded-lg disabled:opacity-50 hover:bg-slate-600"
                                >
                                    ▶
                                </button>
                             </div>
                             
                             <button
                                 onClick={checkAnswer}
                                 className={`flex-1 py-3 font-bold rounded-lg shadow-lg transition-all ${
                                     completed[currentLevel.id] 
                                        ? 'bg-green-600 hover:bg-green-500 text-white' 
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                 }`}
                             >
                                 {completed[currentLevel.id] ? 'Update Answer' : 'Check Code'}
                             </button>

                             {currentLevelIndex === LEVELS.length - 1 && (
                                <button
                                    onClick={finishGame}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg"
                                >
                                    Finish
                                </button>
                             )}
                         </div>
                    </div>

                    {/* Right: Pond Preview */}
                    <div className="flex-1 bg-[#1f2937] border-4 border-slate-700 rounded-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-4 left-4 z-10 text-white/50 font-bold uppercase tracking-widest pointer-events-none">Pond Preview</div>
                        
                        {/* Render User Styles */}
                        <style>{`
                            #pond-preview {
                                display: flex;
                                width: 100%;
                                height: 100%;
                                box-sizing: border-box;
                                /* Default styles that mimic user input's context if needed */
                            }
                            ${css.replace('#pond', '#pond-preview')} 
                        `}</style>
                        
                        {/* Background Lilies (Targets) */}
                        <div className="absolute inset-0 p-8 flex w-full h-full pointer-events-none gap-4 flex-wrap" style={currentLevel.lilypadStyle}>
                             {Array.from({ length: currentLevel.frogs }).map((_, i) => (
                                 <div key={i} className="w-24 h-24 bg-green-800/50 rounded-full border-4 border-green-700/50 flex items-center justify-center m-2 text-4xl opacity-50 shrink-0">
                                     🍃
                                 </div>
                             ))}
                        </div>

                        {/* Foreground Frogs (Moved by User CSS) */}
                        <div id="pond-preview" className="p-8 w-full h-full absolute inset-0 pointer-events-none gap-4">
                             {Array.from({ length: currentLevel.frogs }).map((_, i) => (
                                 <div key={i} className="w-24 h-24 flex items-center justify-center text-6xl m-2 animate-pulse shrink-0">
                                     🐸
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        </GameLayout>
    );
};

export default Game2;
