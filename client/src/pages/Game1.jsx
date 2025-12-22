import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameLayout from '../components/GameLayout';
import api from '../utils/api';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to strip comments for validation
const stripComments = (code) => {
    return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
};

const CHALLENGES = [
    {
        id: 1,
        title: "The Disappearing Act",
        description: "The image pushes the caption out of view! Fix it so both fit nicely.",
        hint: "Check the container's overflow and height properties.",
        language: "css",
        initialCode: `.container {
  width: 300px;
  height: 200px;
  overflow: hidden; /* Fix this line */
  border: 1px solid #fff;
  position: relative;
}
.container img {
  width: 100%;
  height: auto;
}`,
        validation: (code) => {
            const clean = stripComments(code);
            // Must NOT have 'overflow: hidden' active
            // Must have overflow: auto/scroll/visible OR height adjustment maybe? 
            // Simplest fix for "pushes caption out" allowing scroll is overflow: auto
            return !/overflow:\s*hidden/.test(clean) && /overflow:\s*(auto|scroll|visible)/.test(clean);
        },
        type: 'visual',
        render: (code) => (
            <div className="flex items-center justify-center h-full">
                <style>{code}</style>
                <div className="container bg-slate-800 rounded">
                    <img src="https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600" alt="Puppy" />
                    <p className="p-2 text-white bg-slate-700/80 absolute bottom-0 w-full text-center">A cute puppy!</p>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "The Button That Won't Click",
        description: "The close button can't be clicked because of the overlay!",
        hint: "The overlay is blocking clicks. You need to enable pointer events on the button.",
        language: "css",
        initialCode: `.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  pointer-events: none;
  z-index: 10;
}
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  cursor: pointer;
  /* Add something here */
}`,
        validation: (code) => {
            const clean = stripComments(code);
            // Must find pointer-events: auto/all inside .close-btn block ideally, 
            // but for simple regex, just ensuring it exists in the file is a start.
            // Better: split by selector? Too complex for this simple editor.
            // Presence of pointer-events: auto/all is good enough if we assume they don't break .overlay
            return /pointer-events:\s*(auto|all)/.test(clean);
        },
        type: 'visual',
        render: (code) => (
            <div className="relative w-full h-64 bg-slate-700 rounded overflow-hidden">
                <style>{code}</style>
                <div className="p-8 text-white">Content below overlay...</div>
                <div className="overlay"></div>
                <button 
                    className="close-btn bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded shadow-lg active:scale-95 transition-transform"
                    onClick={() => alert("Success! You clicked the button!")}
                >
                    Close X
                </button>
            </div>
        )
    },
    {
        id: 3,
        title: "The Vanishing Value",
        description: "The console shows an empty string because the page reloads!",
        hint: "Prevent the default form submission behavior.",
        language: "javascript",
        initialCode: `// Form Submit Handler
function handleSubmit(e) {
  // Fix missing line here
  
  const input = document.querySelector('input');
  console.log("Submitted:", input.value);
  // form.reset();
}`,
        validation: (code) => {
            const clean = stripComments(code);
            return clean.includes('e.preventDefault()');
        },
        type: 'console',
        logs: (code) => stripComments(code).includes('e.preventDefault()') 
            ? ['> prevented default', '> Submitted: "Hello World"'] 
            : ['> page reloading...', '(console cleared)']
    },
    {
        id: 4,
        title: "The Infinite Loop",
        description: "The API is being called infinitely! Fix the useEffect hook.",
        hint: "The dependency array is missing.",
        language: "javascript",
        initialCode: `useEffect(() => {
  console.log("Fetching user data...");
  setUsers(['Alice', 'Bob']);
}); // Fix this line`,
        validation: (code) => {
            const clean = stripComments(code);
            // Must have [], [users], etc - strict check for dependency array closing
            return /useEffect\(\(\)\s*=>\s*{[\s\S]*?},\s*\[.*\]\s*\)/.test(clean.replace(/\s+/g, ' '));
        },
        type: 'console',
        logs: (code) => {
            const clean = stripComments(code);
            const isFixed = /useEffect\(\(\)\s*=>\s*{[\s\S]*?},\s*\[.*\]\s*\)/.test(clean.replace(/\s+/g, ' '));
            return isFixed 
                ? ['> Fetching user data...', '> (Effect ran once)'] 
                : ['> Fetching user data...', '> Fetching user data...', '> Fetching user data...', '> (Infinite Loop detected!)'];
        }
    },
    {
        id: 5,
        title: "The Z-Index Nightmare",
        description: "The dropdown appears BEHIND the modal container.",
        hint: "The modal creates a new stacking context.",
        language: "css",
        initialCode: `.modal-container {
  position: relative;
  z-index: 10;
  background: #334155;
  padding: 20px;
  border-radius: 8px;
  /* Try isolation or z-index changes */
}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 200px;
  background: #2563eb;
  padding: 10px;
  z-index: 9999;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
.content-below {
  position: relative;
  z-index: 20;
  background: #475569;
  padding: 20px;
  margin-top: -10px;
  border-radius: 8px;
}`,
        validation: (code) => {
             const clean = stripComments(code);
             // Solution 1: Remove z-index from .modal-container
             // Solution 2: set z-index: auto on .modal-container
             // Solution 3: set isolation: isolate (maybe? depends on browser)
             // Solution 4: make dropdown fixed (but that breaks flow sometimes)
             
             // Check if .modal-container still has z-index: 10
             // We can check if z-index: 10 is REMOVED or CHANGED to auto
             const modalHasIndex = /\.modal-container\s*{[^}]*z-index:\s*10[^}]*}/.test(clean.replace(/\s+/g, ' '));
             const modalHasAuto = /\.modal-container\s*{[^}]*z-index:\s*auto[^}]*}/.test(clean.replace(/\s+/g, ' '));
             
             return !modalHasIndex || modalHasAuto;
        },
        type: 'visual',
        render: (code) => (
            <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
                <style>{code}</style>
                <div className="modal-container text-white w-64">
                    I am the Modal Parent
                    <div className="dropdown text-white font-bold">
                        I am the Dropdown!
                    </div>
                </div>
                <div className="content-below text-white w-64 h-32">
                    I am content below with z-index: 20.
                    If broken, dropdown is behind me.
                </div>
            </div>
        )
    },
    {
        id: 6,
        title: "Memory Leak Hunt",
        description: "The cache grows infinitely.",
        hint: "You need to limit the cache size.",
        language: "javascript",
        initialCode: `function addToCache(data) {
  cache.push(data);
  // Add cleanup or limit here
  
  console.log("Cache size:", cache.length);
}`,
        validation: (code) => {
            const clean = stripComments(code);
            return clean.includes('shift()') || clean.includes('splice') || clean.includes('length = 0') || clean.includes('=[]');
        },
        type: 'console',
        logs: (code) => {
             const clean = stripComments(code);
             const hasCleanup = clean.includes('shift()') || clean.includes('splice') || clean.includes('length = 0') || clean.includes('=[]');
             return hasCleanup
                ? ['> Cache size: 1', '> ...', '> Cache size: 100', '> (Cleanup triggered)', '> Cache size: 100']
                : ['> Cache size: 1', '> Cache size: 2', '> ...', '> Cache size: 99999', '> (Crash imminent!)'];
        }
    }
];

const Game1 = () => {
    const { user } = useGame();
    const navigate = useNavigate();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [code, setCode] = useState("");
    const [results, setResults] = useState({});
    const [timeLeft, setTimeLeft] = useState(1200);

    const currentChallenge = CHALLENGES[currentIndex];

    useEffect(() => {
        setCode(currentChallenge.initialCode);
        setResults(prev => ({ ...prev, [currentChallenge.id]: undefined })); // Reset status on switch?
    }, [currentIndex]);

    // Timer logic same as before...
     useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev <= 1 ? 0 : prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleCheck = async () => {
        const isValid = currentChallenge.validation(code);
        setResults(prev => ({ ...prev, [currentChallenge.id]: isValid }));
        
        if (isValid) {
            try {
                await api.post('/game/submit/html', {
                   questionId: currentChallenge.id,
                   answer: "FIXED",
                   isCorrect: true
                });
            } catch(e) {}
        }
    };

    const handleNext = () => currentIndex < CHALLENGES.length - 1 && setCurrentIndex(prev => prev + 1);
    const handlePrev = () => currentIndex > 0 && setCurrentIndex(prev => prev - 1);
    const finishGame = async () => {
         if (!window.confirm("Submit Debugging Challenges?")) return;
         try {
             await api.post('/game/finish/game1');
             navigate('/game2');
         } catch(e) {}
    };

    return (
        <GameLayout>
            <div className="max-w-[1600px] mx-auto p-4 flex flex-col h-[calc(100vh-80px)]">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <h1 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        🐛 Debugging Challenge
                    </h1>
                     <div className="text-2xl font-mono font-bold text-blue-400">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 flex flex-col gap-2 overflow-y-auto pr-2">
                        {CHALLENGES.map((c, idx) => (
                             <button
                                key={c.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`p-4 rounded-xl text-left border transition-all ${
                                    idx === currentIndex
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                                        : results[c.id]
                                            ? 'bg-slate-800 border-green-500 text-green-400'
                                            : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold opacity-70">BUG #{c.id}</span>
                                    {results[c.id] && <span>✔</span>}
                                </div>
                                <div className="font-bold text-sm line-clamp-1">{c.title}</div>
                            </button>
                        ))}
                    </div>

                    {/* Main Content Split */}
                    <div className="flex-1 flex bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Left: Code Editor */}
                        <div className="w-1/2 flex flex-col border-r border-slate-700">
                             <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                                    Code Editor ({currentChallenge.language})
                                </h2>
                                <button onClick={handleCheck} className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-sm transition-all flex items-center gap-2">
                                    ▶ Run & Verify
                                </button>
                             </div>
                             
                             <div className="p-4 bg-slate-800/50 border-b border-slate-700 text-sm text-slate-300">
                                 <p className="mb-2 font-bold text-white">{currentChallenge.title}</p>
                                 <p>{currentChallenge.description}</p>
                                 <div className="mt-2 text-yellow-400 text-xs">💡 Hint: {currentChallenge.hint}</div>
                             </div>

                             <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="flex-1 bg-[#1e1e1e] text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none"
                                spellCheck="false"
                            />
                        </div>

                        {/* Right: Output/Preview */}
                        <div className="w-1/2 flex flex-col bg-[#0d1117]">
                            <div className="bg-slate-800 p-4 border-b border-slate-700">
                                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                                    {currentChallenge.type === 'visual' ? 'Live Preview' : 'Console Output'}
                                </h2>
                            </div>

                            <div className="flex-1 relative overflow-auto">
                                {currentChallenge.type === 'visual' ? (
                                    <div className="h-full w-full">
                                        {currentChallenge.render(code)}
                                    </div>
                                ) : (
                                    <div className="p-4 font-mono text-sm space-y-2">
                                        <div className="text-slate-500">// Simulated Console Output</div>
                                        {currentChallenge.logs(code).map((log, i) => (
                                            <div key={i} className={`${log.includes('Infinite') || log.includes('Crash') ? 'text-red-400' : 'text-green-400'}`}>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <AnimatePresence>
                                    {results[currentChallenge.id] !== undefined && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`absolute bottom-4 right-4 p-4 rounded-xl shadow-2xl border backdrop-blur-md ${
                                                results[currentChallenge.id] 
                                                    ? 'bg-green-500/20 border-green-400 text-green-200' 
                                                    : 'bg-red-500/20 border-red-400 text-red-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 font-bold text-lg">
                                                <span>{results[currentChallenge.id] ? '🎉' : '❌'}</span>
                                                {results[currentChallenge.id] ? 'Bug Squashed!' : 'Issue Detected'}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                             <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-between">
                                <button onClick={handlePrev} disabled={currentIndex === 0} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50">Previous</button>
                                {currentIndex === CHALLENGES.length - 1 ? (
                                    <button onClick={finishGame} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow-lg">Finish Phase 1</button>
                                ) : (
                                    <button onClick={handleNext} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Next Challenge</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GameLayout>
    );
};

export default Game1;
