import { useEffect } from 'react';
import { useGame } from '../context/GameContext';

const useAntiCheat = () => {
    const { user, lockUser } = useGame();

    useEffect(() => {
        if (!user || user.status === 'locked' || user.status === 'disqualified' || user.status === 'completed') {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User switched tab or minimized
                lockUser();
            }
        };

        const handleBlur = () => {
            // User clicked outside window or alt-tabbed
            // Note: This can be sensitive (e.g. clicking on browser UI). 
            // implementation_plan says "Mandatory".
            lockUser();
        };

        // Prevent Context Menu
        const handleContextMenu = (e) => e.preventDefault();
        
        // Prevent Shortcuts
        const handleKeyDown = (e) => {
             // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+Shift+I (key 'I' is 73)
             if (e.ctrlKey && ['c', 'v', 'x', 'a', 'u'].includes(e.key.toLowerCase())) {
                 e.preventDefault();
             }
             if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
                 e.preventDefault();
             }
             if (e.key === 'F12') {
                 e.preventDefault();
             }
        };


        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        // window.addEventListener('blur', handleBlur); // Too sensitive
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [user, lockUser]);
};

export default useAntiCheat;
