import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/admin/login', { username, password });
            if (data.token) {
                // Store admin token? Or just same token key?
                // Simplest: same keys.
                // But AdminDashboard didn't check auth strictly in my code, relying on backend specific route protections? 
                // Wait, AdminDashboard uses `/admin/users` which should be protected.
                // My `authMiddleware` expects `Authorization: Bearer undefined` if I don't set it.
                // I need to set token.
                localStorage.setItem('token', data.token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            alert('Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
            <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl shadow-xl w-full max-w-sm border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Admin Access</h2>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white"
                    />
                     <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded text-white font-bold">
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminLogin;
