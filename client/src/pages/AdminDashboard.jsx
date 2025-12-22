import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unlockCode, setUnlockCode] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Fetch live data every 5 seconds
    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsers = async () => {
        try {
            // Need Admin Token? We assume simple auth or use the same 'api' instance if logged in as Admin
            // Admin login logic separate.
            // For now, if logged in user is admin, this works.
            const { data } = await api.get('/admin/users');
            
            // Client-side sort: Highest Score -> Lowest Total Time
            const sortedData = data.sort((a, b) => {
                const scoreDiff = (b.scores?.total || 0) - (a.scores?.total || 0);
                if (scoreDiff !== 0) return scoreDiff;
                
                const timeA = (a.timings?.game1Time || 0) + (a.timings?.game2Time || 0);
                const timeB = (b.timings?.game1Time || 0) + (b.timings?.game2Time || 0);
                return timeA - timeB;
            });

            setUsers(sortedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlockDirect = async (userId) => {
        if (!window.confirm("Unlock this user? They will be allowed to continue immediately.")) return;
        try {
            await api.post('/admin/unlock-user', { userId });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to unlock user');
        }
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ teckziteId: '', name: '', mobileNumber: '' });

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/create-user', newUser);
            setShowCreateModal(false);
            setNewUser({ teckziteId: '', name: '', mobileNumber: '' });
            fetchUsers();
            alert('User Created Successfully');
        } catch (err) {
            console.error('Create User Error:', err);
            console.error('Create User Error:', err);
            // Show meaningful error or fallback
            alert(err.response?.data?.message || 'Failed to create user. Check console for details.');
        }
    };

    const disqualifyUser = async (userId) => {
        if (!window.confirm("Disqualify User? This cannot be undone.")) return;
         try {
            await api.post('/admin/disqualify', { userId });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
             {/* Admin Header */}
             <div className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm">
                 <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                     <h1 className="text-xl font-bold text-slate-800">Admin Control Center</h1>
                 </div>
                 <div className="flex gap-4">
                     <button
                         onClick={() => setShowCreateModal(true)}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                     >
                         + Create Player
                     </button>
                     <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-bold text-sm border border-blue-100 flex items-center gap-2">
                         <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                         Live: {users.length}
                     </div>
                 </div>
             </div>



            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Player</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Teckzite ID</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                    value={newUser.teckziteId}
                                    onChange={e => setNewUser({...newUser, teckziteId: e.target.value.toUpperCase()})}
                                    placeholder="TZ-XXX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newUser.name}
                                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                                    placeholder="Player Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Mobile Number (Login Password)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    value={newUser.mobileNumber}
                                    onChange={e => setNewUser({...newUser, mobileNumber: e.target.value})}
                                    placeholder="9999999999"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="p-8 max-w-7xl mx-auto">
                {unlockCode && selectedUser && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-xl flex justify-between items-center relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-medium mb-1">Generated Unlock Code for <span className="font-mono bg-blue-500/30 px-2 rounded">{users.find(u => u._id === selectedUser)?.teckziteId}</span></p>
                            <p className="text-5xl font-mono font-bold tracking-[0.2em] drop-shadow-md">{unlockCode}</p>
                        </div>
                         <button 
                            onClick={() => setUnlockCode(null)} 
                            className="relative z-10 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm"
                        >
                            Dismiss
                        </button>
                    </motion.div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-5 border-b border-slate-200">ID</th>
                                    <th className="p-5 border-b border-slate-200">Name</th>
                                    <th className="p-5 border-b border-slate-200">Status</th>
                                    <th className="p-5 border-b border-slate-200">Round</th>
                                    <th className="p-5 border-b border-slate-200">Debug</th>
                                    <th className="p-5 border-b border-slate-200">Flex</th>
                                    <th className="p-5 border-b border-slate-200">Total Score</th>
                                    <th className="p-5 border-b border-slate-200">Time (G1 / G2)</th>
                                    <th className="p-5 border-b border-slate-200">Violations</th>
                                    <th className="p-5 border-b border-slate-200 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-5 font-mono font-bold text-slate-700">{user.teckziteId}</td>
                                        <td className="p-5 font-medium text-slate-900">{user.name || <span className="text-slate-400 italic">Anonymous</span>}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                user.status === 'locked' ? 'bg-red-50 text-red-700 border-red-200' :
                                                user.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                                {user.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-5 text-slate-600">{user.currentRound || '-'}</td>
                                        <td className="p-5 font-mono text-slate-800">{user.scores.html}</td>
                                        <td className="p-5 font-mono text-slate-800">{user.scores.flexbox}</td>
                                        <td className="p-5 font-mono font-bold text-slate-900">{user.scores.total}</td>
                                        <td className="p-5 font-mono text-slate-600">
                                            {(user.timings?.game1Time || 0).toFixed(0)}s / {(user.timings?.game2Time || 0).toFixed(0)}s
                                        </td>
                                        <td className="p-5">
                                             <span className={`font-mono font-bold ${user.violations?.tabSwitchCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                                {user.violations?.tabSwitchCount || 0}
                                             </span>
                                        </td>
                                        <td className="p-5 text-right space-x-3">
                                            {user.status === 'locked' && (
                                                <button 
                                                    onClick={() => handleUnlockDirect(user._id)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm shadow-blue-200"
                                                >
                                                    Unlock
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => disqualifyUser(user._id)}
                                                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Disqualify
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-10 text-center text-slate-400">No participants connected yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
