const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    teckziteId: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    password: { type: String }, // Optional if using ID+Mobile as login
    name: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { 
        type: String, 
        enum: ['active', 'locked', 'disqualified', 'completed'], 
        default: 'active' 
    },
    currentRound: { type: String, default: 'instructions' }, // instructions, game1, game2, finished
    
    scores: {
        html: { type: Number, default: 0 },
        flexbox: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    
    timings: {
        startTime: { type: Date },
        endTime: { type: Date },
        game1Time: { type: Number, default: 0 }, // Seconds taken
        game2Time: { type: Number, default: 0 }
    },
    
    violations: {
        tabSwitchCount: { type: Number, default: 0 },
        unlockAttempts: { type: Number, default: 0 },
        lastViolationAt: { type: Date }
    },
    
    game1State: {
        currentQuestionIndex: { type: Number, default: 0 },
        answers: [{ questionId: Number, answer: String, isCorrect: Boolean }]
    },
    
    game2State: {
        answers: [{ levelId: Number, userCss: String, isCorrect: Boolean }]
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
