import React, { useState } from 'react';
import api from '../utils/api';
import { useGame } from '../context/GameContext';

const LockScreen = () => {
    const { user, syncState } = useGame();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [unlocking, setUnlocking] = useState(false);

    // 1. Detection Logic (Only runs if user is active)
    React.useEffect(() => {
        if (user?.status !== 'active') return;

        // Grace period: Ignore events for first 1s after mount
        const gracePeriod = setTimeout(() => {
             // Ready
        }, 3000); 

        const startTime = Date.now();

        const handleVisibilityChange = () => {
             // Ignore if within 3 seconds of mount
            if (Date.now() - startTime < 3000) return;

            if (document.hidden) {
                // Trigger Lock
                if (user.status === 'active') { // Double check
                     console.log("Locking due to visibility change");
                     api.post('/game/lock').then(() => {
                         syncState();
                     });
                }
            }
        };

        const handleBlur = () => {
             // Optional: window blur (alt-tab)
             // handleVisibilityChange(); // Some prefer strict blur, some just visibility
             if (user.status === 'active') {
                 api.post('/game/lock').then(() => {
                     syncState();
                 });
             }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        // window.addEventListener('blur', handleBlur); // Removed to prevent false positives with confirm() dialogs

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            // window.removeEventListener('blur', handleBlur);
        };
    }, [user?.status]);

    // 2. Polling Logic (Only runs if user is locked)
    React.useEffect(() => {
        if (user?.status === 'locked') {
            const interval = setInterval(() => {
                syncState();
            }, 2000); // Poll every 2 seconds
            return () => clearInterval(interval);
        }
    }, [user?.status]);


    if (user?.status === 'disqualified') {
        return (
            <div className="fixed inset-0 z-50 bg-red-900 flex items-center justify-center text-white">
                <div className="text-center p-8 bg-red-800 rounded-lg shadow-2xl border border-red-600">
                     <h1 className="text-4xl font-bold mb-4">DISQUALIFIED</h1>
                     <p className="text-xl">You have been permanently disqualified for multiple violations.</p>
                     <p className="mt-4 opacity-75">Please contact the admin if you think this is a mistake.</p>
                </div>
            </div>
        );
    }

    if (user?.status !== 'locked') return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 bg-opacity-95 backdrop-blur-sm flex items-center justify-center text-white">
            <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🔒</div>
                    <h2 className="text-3xl font-bold text-red-500">Session Locked</h2>
                    <p className="text-gray-300 mt-2">
                        Tab switching or window loss of focus detected.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        Please ask the admin to unlock you.
                    </p>
                    <div className="mt-4 p-3 bg-blue-900/30 rounded text-blue-200 text-sm animate-pulse">
                         Waiting for Admin Unlock...
                    </div>
                </div>

                {/* Removed Manual Code Entry Form as requested for Direct Admin Unlock flow, 
                    but keeping a simple hidden unlock just in case? No, purely Admin controlled now. */}
                    
                <div className="text-center text-xs text-slate-500 mt-4">
                    User ID: {user.teckziteId} | Violations: {user.violations?.tabSwitchCount}
                </div>
            </div>
        </div>
    );
};

export default LockScreen;
