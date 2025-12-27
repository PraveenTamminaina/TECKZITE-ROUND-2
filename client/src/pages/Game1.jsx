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
        title: "Broken Calculator",
        description: "The function returns '55' instead of 10! The output must be the number 10.",
        language: "javascript",
        initialCode: `function add(a, b) {
  // Input: a=5, b="5"
  return a + b;
}

console.log(add(5, "5"));`,
        validation: (code) => {
            const clean = stripComments(code);
            return (clean.includes('parseInt') || clean.includes('Number(') || clean.includes('+a') || clean.includes('+b') || clean.includes('1*'));
        },
        type: 'console',
        logs: (code) => {
            const clean = stripComments(code);
            const isFixed = (clean.includes('parseInt') || clean.includes('Number(') || clean.includes('+a') || clean.includes('+b') || clean.includes('1*'));
            return isFixed 
                ? ['> 10'] 
                : ['> "55"'];
        }
    },
    {
        id: 2,
        title: "The Scope Trap",
        description: "The loop prints '3' three times! It should print 0, 1, 2.",
        language: "javascript",
        initialCode: `for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 100);
}`,
        validation: (code) => {
            const clean = stripComments(code);
            return clean.includes('let i') || clean.includes('forEach');
        },
        type: 'console',
        logs: (code) => {
             const clean = stripComments(code);
             return (clean.includes('let i') || clean.includes('forEach'))
                ? ['> 0', '> 1', '> 2']
                : ['> 3', '> 3', '> 3'];
        }
    },
    {
        id: 3,
        title: "The Vanishing Value",
        description: "Console shows empty string because the page reloads! Fix it to log 'Submitted: Hello World'.",
        language: "javascript",
        initialCode: `// Form Submit Handler
function handleSubmit(e) {
  
  
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
        description: "Infinite API calls! Fix the useEffect dependency array issue. Expected: '(Effect ran once)'.",
        language: "javascript",
        initialCode: `function fetchUserData() {
  // const [users, setUsers] = useState([]);
  
  useEffect(() => {
    console.log("Fetching /api/users...");
    // setUsers(data);
  });
}`,
        validation: (code) => {
            const clean = stripComments(code);
            return /useEffect\(\(\)\s*=>\s*{[\s\S]*?},\s*\[.*\]\s*\)/.test(clean.replace(/\s+/g, ' '));
        },
        type: 'console',
        logs: (code) => {
            const clean = stripComments(code);
            const isFixed = /useEffect\(\(\)\s*=>\s*{[\s\S]*?},\s*\[.*\]\s*\)/.test(clean.replace(/\s+/g, ' '));
            return isFixed 
                ? ['> Fetching /api/users...', '> (Effect ran once)'] 
                : ['> Fetching /api/users...', '> Fetching /api/users...', '> (Infinite Loop detected!)'];
        }
    },
    {
        id: 5,
        title: "Unintended Mutation",
        description: "Sorting the array changed the original data! Keep 'original' as [3, 1, 2].",
        language: "javascript",
        initialCode: `const original = [3, 1, 2];
const sorted = original.sort();

console.log("Original:", original); // Should be [3, 1, 2]
console.log("Sorted:", sorted);     // Should be [1, 2, 3]`,
        validation: (code) => {
            const clean = stripComments(code);
            return clean.includes('[...original]') || clean.includes('slice()') || clean.includes('from(original)') || clean.includes('concat()');
        },
        type: 'console',
        logs: (code) => {
             const clean = stripComments(code);
             const isFixed = clean.includes('[...original]') || clean.includes('slice()') || clean.includes('from(original)') || clean.includes('concat()');
             return isFixed
                ? ['> Original: [3, 1, 2]', '> Sorted: [1, 2, 3]']
                : ['> Original: [1, 2, 3] (Whoops!)', '> Sorted: [1, 2, 3]'];
        }
    },
    {
        id: 6,
        title: "Memory Leak Hunt",
        description: "App crashes after running for a while! Cache grows infinitely.",
        language: "javascript",
        initialCode: `let cache = [];

function addToCache(data) {
  cache.push(data);
  
  
  console.log("Cache size:", cache.length);
}`,
        validation: (code) => {
            const clean = stripComments(code);
            return clean.includes('shift()') || clean.includes('splice') || clean.includes('length = 0') || clean.includes('=[]') || (clean.includes('if') && clean.includes('length'));
        },
        type: 'console',
        logs: (code) => {
             const clean = stripComments(code);
             const hasCleanup = clean.includes('shift()') || clean.includes('splice') || clean.includes('length = 0') || clean.includes('=[]') || (clean.includes('if') && clean.includes('length'));
             return hasCleanup
                ? ['> Cache size: 1', '> ...', '> Cache size: 100', '> (Cleanup triggered)', '> Cache size: 100']
                : ['> Cache size: 1', '> Cache size: 2', '> ...', '> Cache size: 99999', '> (Crash imminent!)'];
        }
    },
    {
        id: 7,
        title: "Lost Context",
        description: "The object method loses access to 'this' when passed as a callback. Fix it to log 'Alice'.",
        language: "javascript",
        initialCode: `const user = {
    name: 'Alice',
    greet() {
        console.log("Hello, " + this.name);
    }
};

// Lost context here:
setTimeout(user.greet, 100);`,
        validation: (code) => {
            const clean = stripComments(code);
            return clean.includes('bind(user)') || clean.includes('() => user.greet()') || clean.includes('call') || clean.includes('apply');
        },
        type: 'console',
        logs: (code) => {
            const clean = stripComments(code);
            const isFixed = clean.includes('bind(user)') || clean.includes('() => user.greet()') || clean.includes('call') || clean.includes('apply');
            return isFixed
                ? ['> Hello, Alice']
                : ['> Hello, undefined'];
        }
    },
    {
        id: 8,
        title: "Floating Point Precision",
        description: "0.1 + 0.2 checks against 0.3 but fails! Fix the condition to log 'Equal'.",
        language: "javascript",
        initialCode: `const result = 0.1 + 0.2;
const expected = 0.3;

if (result === expected) {
    console.log("Equal");
} else {
    console.log("Not Equal");
}`,
        validation: (code) => {
            const clean = stripComments(code);
            return clean.includes('Math.abs') || clean.includes('toFixed') || clean.includes('< Number.EPSILON');
        },
        type: 'console',
        logs: (code) => {
            const clean = stripComments(code);
            const isFixed = clean.includes('Math.abs') || clean.includes('toFixed') || clean.includes('< Number.EPSILON');
            return isFixed
                ? ['> Equal']
                : ['> Not Equal'];
        }
    },
    {
        id: 9,
        title: "Silent Filter",
        description: "Filter returns an empty array! Fix it to return numbers greater than 10 ([15, 20]).",
        language: "javascript",
        initialCode: `const numbers = [5, 10, 15, 20];
const filtered = numbers.filter(num => {
    num > 10;
});

console.log(filtered);`,
        validation: (code) => {
            const clean = stripComments(code);
            return (clean.includes('return num > 10') || (clean.includes('=>') && !clean.includes('{') && clean.includes('num > 10')));
        },
        type: 'console',
        logs: (code) => {
            const clean = stripComments(code);
            const isFixed = (clean.includes('return num > 10') || (clean.includes('=>') && !clean.includes('{') && clean.includes('num > 10')));
            return isFixed
                ? ['> [15, 20]']
                : ['> []'];
        }
    },
    {
        id: 10,
        title: "Immutable String",
        description: "String assignment doesn't work! Fix the function to return 'Hello'.",
        language: "javascript",
        initialCode: `function capitalize() {
    let str = "hello";
    str[0] = "H"; // This does nothing
    return str;
}

console.log(capitalize());`,
        validation: (code) => {
            const clean = stripComments(code);
            return clean.includes('replace') || clean.includes('slice') || clean.includes('charAt') || clean.includes('"H" +');
        },
        type: 'console',
        logs: (code) => {
            const clean = stripComments(code);
            const isFixed = clean.includes('replace') || clean.includes('slice') || clean.includes('charAt') || clean.includes('"H" +');
            return isFixed
                ? ['> "Hello"']
                : ['> "hello"'];
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
