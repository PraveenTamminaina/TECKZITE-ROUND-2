import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/auth/me');
            setUser(data);
        } catch (err) {
            console.error("Failed to load user", err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (teckziteId, mobileNumber) => {
        try {
            const { data } = await api.post('/auth/login', { teckziteId, mobileNumber });
            localStorage.setItem('token', data.token);
            setUser(data);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const syncState = async () => {
        try {
            const { data } = await api.get('/game/status');
            setUser(data);
        } catch (err) {
            console.error("Sync failed", err);
        }
    };
    
    const lockUser = async () => {
        try {
            // Optimistic update
            setUser(prev => ({ ...prev, status: 'locked' }));
            const { data } = await api.post('/game/lock');
            setUser(data);
        } catch (err) {
            console.error("Lock failed", err);
        }
    };

    // Global Anti-Cheat Listener (Context is a good place if it wraps everything)
    // But might be better in a dedicated Hook or Component to ensure it runs
    
    return (
        <GameContext.Provider value={{ user, loading, error, login, logout, syncState, lockUser, setUser }}>
            {children}
        </GameContext.Provider>
    );
};
