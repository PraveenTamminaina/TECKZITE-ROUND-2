const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   POST /api/game/start
// @desc    Start the round timer
router.post('/start', protect, async (req, res) => {
    try {
        const user = req.user;
        if (!user.timings.startTime) {
            user.timings.startTime = new Date();
            user.currentRound = 'game1';
            await user.save();
        }
        res.json(user);
    } catch (error) {
        console.error('Error in /start:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/game/status
// @desc    Get current game state (sync)
router.get('/status', protect, async (req, res) => {
    // Send back relevant user state
    res.json(req.user);
});

// @route   POST /api/game/submit/html
// @desc    Submit answer for HTML treasure hunt (Silent & Idempotent)
router.post('/submit/html', protect, async (req, res) => {
    const { questionId, answer, isCorrect } = req.body;
    const user = req.user;

    if (user.status === 'locked' || user.status === 'disqualified') {
        return res.status(403).json({ message: 'User is locked or disqualified' });
    }

    // Initialize scores if undefined
    if (!user.scores) user.scores = { html: 0, flexbox: 0, total: 0 };
    if (!user.game1State.answers) user.game1State.answers = [];

    // Check if this question was already answered
    const existingIndex = user.game1State.answers.findIndex(a => a.questionId === questionId);

    // If updating an existing answer, revert its score impact first
    if (existingIndex !== -1) {
        const previousAnswer = user.game1State.answers[existingIndex];
        if (previousAnswer.isCorrect) {
            user.scores.html -= 10;
        }
        // Remove old answer
        user.game1State.answers.splice(existingIndex, 1);
    }

    // Apply new score
    if (isCorrect) {
        user.scores.html += 10;
    }
    
    user.scores.total = user.scores.html + user.scores.flexbox;

    // Store new attempt
    user.game1State.answers.push({ questionId, answer, isCorrect });
    
    // We do NOT increment currentQuestionIndex automatically anymore as navigation is free
    
    await user.save();
    // Silent response: Do not return isCorrect or score
    res.json({ success: true, scores: user.scores });
});

// @route   POST /api/game/finish/game1
// @desc    Finish Game 1 and Start Game 2
router.post('/finish/game1', protect, async (req, res) => {
    const user = req.user;
    if (user.currentRound === 'game1') {
        user.currentRound = 'game2';
        
        const startTime = user.timings.startTime ? new Date(user.timings.startTime).getTime() : Date.now();
        const duration = (Date.now() - startTime) / 1000;
        
        user.timings.game1Time = isNaN(duration) ? 0 : duration;
        
        await user.save();
    }
    res.json(user);
});

// @route   POST /api/game/submit/flexbox
// @desc    Submit answer for Flexbox level (Silent & Idempotent)
router.post('/submit/flexbox', protect, async (req, res) => {
    const { level, userCss, isCorrect } = req.body;
    const user = req.user;

    if (user.status === 'locked' || user.status === 'disqualified') {
        return res.status(403).json({ message: 'User is locked or disqualified' });
    }

    if (!user.game2State.answers) user.game2State.answers = [];

    // Check if this level was already answered
    const existingIndex = user.game2State.answers.findIndex(a => a.levelId === level);

    // Revert score if updating
    if (existingIndex !== -1) {
        const prev = user.game2State.answers[existingIndex];
        if (prev.isCorrect) {
            user.scores.flexbox -= 5;
        }
        user.game2State.answers.splice(existingIndex, 1);
    }

    // Apply new score
    if (isCorrect) {
        user.scores.flexbox += 5;
    }

    user.scores.total = (user.scores.html || 0) + user.scores.flexbox;

    // Save new answer
    user.game2State.answers.push({ levelId: level, userCss, isCorrect });
    
    await user.save();
    res.json({ success: true, scores: user.scores });
});

// @route   POST /api/game/finish
// @desc    Finish Round 2
router.post('/finish', protect, async (req, res) => {
    const user = req.user;
    user.status = 'completed';
    user.timings.endTime = new Date();
    
    const now = Date.now();
    let startTime = now;
    
    if (user.timings.startTime) {
        const parsed = new Date(user.timings.startTime).getTime();
        if (!isNaN(parsed)) startTime = parsed;
    }
    
    const totalDuration = (now - startTime) / 1000;
    const game1Duration = user.timings.game1Time || 0;
    
    const calculatedTime = totalDuration - game1Duration;
    // Validated game2Time calculation: ensure Number, not NaN, min 0
    user.timings.game2Time = isNaN(calculatedTime) ? 0 : Math.max(0, calculatedTime);
    
    await user.save();
    res.json(user);
});

// @route   POST /api/game/lock
// @desc    Lock user due to violation
router.post('/lock', protect, async (req, res) => {
    const user = req.user;
    if (user.status !== 'disqualified' && user.status !== 'completed') {
        user.status = 'locked';
        user.violations.tabSwitchCount += 1;
        user.violations.lastViolationAt = new Date();
        
        // REMOVED: Permanent disqualification rule based on count.
        // User is just locked indefinitely until unlocked by admin.
        // if (user.violations.tabSwitchCount >= 2) {
        //    user.status = 'disqualified';
        // }
        
        await user.save();
    }
    res.json(user);
});

// @route   POST /api/game/unlock
// @desc    Unlock user with admin code
router.post('/unlock', protect, async (req, res) => {
    const { code } = req.body;
    const user = req.user;
    
    if (user.status !== 'locked') {
        return res.status(400).json({ message: 'User is not locked' });
    }
    
    const UnlockCode = require('../models/UnlockCode');
    const validCode = await UnlockCode.findOne({ 
        code, 
        userId: user._id, 
        isUsed: false,
        expiresAt: { $gt: new Date() }
    });
    
    if (validCode) {
        validCode.isUsed = true;
        await validCode.save();
        
        user.status = 'active';
        user.violations.unlockAttempts += 1;
        await user.save();
        
        res.json({ success: true, message: 'User unlocked' });
    } else {
        res.status(400).json({ message: 'Invalid or Expired Code' });
    }
});

module.exports = router;
