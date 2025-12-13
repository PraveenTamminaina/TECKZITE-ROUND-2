const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { teckziteId, mobileNumber } = req.body;
    console.log(`Login Attempt: ID=[${teckziteId}] Mobile=[${mobileNumber}]`);

    try {
        // Case insensitive lookup + trimming
        const cleanId = teckziteId.trim();
        const cleanMobile = mobileNumber.trim();
        
        const user = await User.findOne({ teckziteId: { $regex: new RegExp(`^${cleanId}$`, 'i') } });

        if (!user) {
            console.log('Login Failed: User not found in DB');
            return res.status(401).json({ message: 'Invalid Credentials (User not found)' });
        }

        if (user.mobileNumber !== cleanMobile) {
            console.log(`Login Failed: Mobile mismatch. Expected [${user.mobileNumber}] Got [${cleanMobile}]`);
            return res.status(401).json({ message: 'Invalid Credentials (Mobile number incorrect)' });
        }
        
        if (user) {
            
            if (user.status === 'disqualified') {
                return res.status(403).json({ message: 'You have been disqualified.' });
            }

            if (user.completed) {
                return res.status(403).json({ message: 'You have already completed the round.' });
            }

            // Update login time if first login? Or every time?
            // "Each Teckzite ID can attempt Round 2 only once" -> handled by 'completed' status.
            // But if they refresh/re-login during the round, it's allowed unless locked?
            // "Login required... attempt Round 2 only once" implies if they finish, they can't login again.
            
            res.json({
                _id: user._id,
                teckziteId: user.teckziteId,
                name: user.name,
                role: user.role,
                token: generateToken(user._id),
                status: user.status,
                currentRound: user.currentRound
            });
        } else {
            res.status(401).json({ message: 'Invalid Credentials' });
        }
    } catch (error) {
        console.error('Player Login Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
    }
});

// @route   POST /api/auth/admin/login
// @desc    Admin Login
router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const Admin = require('../models/Admin');
        const adminUser = await Admin.findOne({ username });

        if (!adminUser) {
            return res.status(401).json({ message: 'Invalid Admin Credentials' });
        }

        const isMatch = await require('bcryptjs').compare(password, adminUser.password);

        if (isMatch) {
            const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '4h' });
            res.json({
                token,
                role: 'admin'
            });
        } else {
            res.status(401).json({ message: 'Invalid Admin Credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile & state
// @access  Private
router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
});

module.exports = router;
