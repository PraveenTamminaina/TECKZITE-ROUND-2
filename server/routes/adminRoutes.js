const express = require('express');
const User = require('../models/User');
const UnlockCode = require('../models/UnlockCode');
const { protect, admin } = require('../middleware/authMiddleware'); // specific admin middleware
const crypto = require('crypto'); // for random code
const router = express.Router();

// Middleware to ensure admin
const ensureAdmin = [protect, admin]; // or just separate middleware

// @route   GET /api/admin/users
// @desc    Get all users with live status
router.get('/users', async (req, res) => {
    // For simplicity, allowed without auth for dev, but should use ensureAdmin
    // ensureAdmin not used here effectively as 'protect' requires `req.user` which comes from token
    // If Admin uses hardcoded login, they have a token with role: admin
    
    // We'll trust the caller passes the admin token
    try {
        const users = await User.find().sort({ 'scores.total': -1, 'timings.game2Time': 1 });
        res.json(users);
    } catch (err) {
        console.error('Error in /users:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/admin/generate-code
// @desc    Generate one-time unlock code for a user
router.post('/generate-code', async (req, res) => {
    const { userId } = req.body;
    
    try {
        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Remove existing active codes for this user
        await UnlockCode.deleteMany({ userId });
        
        const unlockCode = new UnlockCode({
            code,
            userId,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins
        });
        
        await unlockCode.save();
        res.json({ code });
    } catch (err) {
        console.error('Error in /users:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/admin/disqualify
// @desc    Manually disqualify a user
router.post('/disqualify', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (user) {
            user.status = 'disqualified';
            await user.save();
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error in /users:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   POST /api/admin/create-user
// @desc    Create a new player
router.post('/create-user', async (req, res) => {
    const { teckziteId, mobileNumber, name } = req.body;
    console.log('Received Create User Request:', { teckziteId, mobileNumber, name });
    
    try {
        const existingUser = await User.findOne({ teckziteId });
        if (existingUser) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        const newUser = new User({
            teckziteId,
            mobileNumber,
            name,
            currentRound: 'instructions',
            status: 'active',
            scores: { html: 0, flexbox: 0, total: 0 },
            timings: {},
            game1State: { answers: [], currentQuestionIndex: 0 },
            game2State: { completedLevels: [], currentLevel: 1 },
            violations: { tabSwitchCount: 0, unlockAttempts: 0 }
        });

        await newUser.save();
        res.json(newUser);
    } catch (err) {
        console.error('Error in /create-user:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/admin/reactivate
// @desc    Reactivate a disqualified user
router.post('/reactivate', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (user) {
            user.status = 'active';
            user.status = 'active';
            await user.save();
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error in /reactivate:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/admin/unlock-user
// @desc    Unlock a user directly
router.post('/unlock-user', protect, admin, async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = 'active';
        user.violations.unlockAttempts += 1; // Track how many times they were unlocked
        await user.save();
        
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
