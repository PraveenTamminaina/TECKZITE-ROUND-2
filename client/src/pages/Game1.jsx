import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameLayout from '../components/GameLayout';
import api from '../utils/api';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

const RIDDLES = [
    { id: 1, question: "I define the main navigation area of a webpage.", answer: "nav" },
    { id: 2, question: "I am the largest and most important heading.", answer: "h1" },
    { id: 3, question: "I define a paragraph of text.", answer: "p" },
    { id: 4, question: "I create an unordered (bulleted) list.", answer: "ul" },
    { id: 5, question: "I define an image in an HTML document.", answer: "img" },
    { id: 6, question: "I represent the main content of the <body>.", answer: "main" },
    { id: 7, question: "I define a hyperlink.", answer: "a" },
    { id: 8, question: "I am used to separate content, often a thematic break (horizontal rule).", answer: "hr" },
    { id: 9, question: "I define a section in a document.", answer: "section" },
    { id: 10, question: "I define independent, self-contained content.", answer: "article" }
];

const Game1 = () => {
    const { user, syncState } = useGame();
    const navigate = useNavigate();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { 1: "nav", 2: "h1" }
    const [saving, setSaving] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

    // Load initial state from DB & Force Start if missing
    useEffect(() => {
        if (user) {
            if (!user.timings?.startTime) {
                 // Failsafe: User somehow skipped start logic, trigger it now
                 api.post('/game/start').then(res => {
                     // Update local user context if needed? 
                     // Usually context updates on next sync, but let's be safe
                 }).catch(console.error);
            }

            if (user.game1State && user.game1State.answers) {
                const initialAnswers = {};
                user.game1State.answers.forEach(a => {
                    initialAnswers[a.questionId] = a.answer;
                });
                setAnswers(initialAnswers);
            }
        }
    }, [user]); 

    // Timer Effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishGame1(); // Auto-submit
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

    const handleAnswerChange = (val) => {
        setAnswers(prev => ({ ...prev, [RIDDLES[currentIndex].id]: val }));
    };

    const saveCurrentAnswer = async () => {
        const currentRiddle = RIDDLES[currentIndex];
        const currentAnswer = answers[currentRiddle.id];
        
        if (currentAnswer === undefined || currentAnswer === '') return; // Don't save empty if not needed? Or should we to clear?

        // Check correctness locally to send to backend (as per established protocol)
        const isCorrect = currentAnswer.trim().toLowerCase() === currentRiddle.answer.toLowerCase();

        setSaving(true);
        try {
            await api.post('/game/submit/html', {
                questionId: currentRiddle.id,
                answer: currentAnswer,
                isCorrect
            });
            // Silent success
        } catch (err) {
            console.error("Save error", err);
        } finally {
            setSaving(false);
        }
    };

    const handleNext = async () => {
        await saveCurrentAnswer();
        if (currentIndex < RIDDLES.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = async () => {
        await saveCurrentAnswer();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleJump = async (index) => {
        await saveCurrentAnswer();
        setCurrentIndex(index);
    };

    const finishGame1 = async () => {
        await saveCurrentAnswer(); // Save last question
        if (!window.confirm("Are you sure you want to submit all answers and finish Game 1?")) return;

        try {
            // alert('Submitting... Please wait.'); // Optional: feedback
            await api.post('/game/finish/game1');
            // window.location.href = '/game2';
            navigate('/game2');
        } catch (err) {
            console.error("Finish error", err);
            alert('Submit Failed: ' + (err.response?.data?.message || err.message || 'Server Error'));
        }
    };

    const currentRiddle = RIDDLES[currentIndex];

    return (
        <GameLayout>
            <div className="max-w-6xl mx-auto p-4 flex flex-col items-center min-h-[calc(100vh-80px)]">
                
                {/* Navigation Grid */}
                <div className="w-full max-w-3xl mb-8 flex flex-wrap gap-2 justify-center">
                    {RIDDLES.map((r, idx) => (
                        <button
                            key={r.id}
                            onClick={() => handleJump(idx)}
                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                                idx === currentIndex 
                                    ? 'bg-blue-600 text-white shadow-lg scale-110' 
                                    : answers[r.id] 
                                        ? 'bg-blue-900/50 text-blue-200 border border-blue-500/30' 
                                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-3xl bg-slate-800/80 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl border border-slate-700/50 text-center relative"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    
                    <div className="mb-8 flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-700/50 pb-4">
                        <span className="flex items-center gap-2">Question {currentIndex + 1} / {RIDDLES.length}</span>
                        <span className={`text-xl font-mono ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-12 leading-relaxed h-32 flex items-center justify-center">
                        "{currentRiddle?.question}"
                    </h2>

                    <div className="max-w-md mx-auto space-y-8">
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-2xl">&lt;</span>
                            <input
                                type="text"
                                value={answers[currentRiddle.id] || ''}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                className="w-full bg-slate-900/80 border-2 border-slate-700/80 rounded-xl py-4 px-12 text-2xl font-mono text-center text-blue-400 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] focus:outline-none transition-all placeholder-slate-700"
                                placeholder="tagname"
                                spellCheck="false"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-2xl">&gt;</span>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            
                            {currentIndex === RIDDLES.length - 1 ? (
                                <button
                                    onClick={finishGame1}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all"
                                >
                                    Submit Quiz
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </GameLayout>
    );
};

export default Game1;
