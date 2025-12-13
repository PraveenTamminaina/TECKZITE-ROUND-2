const mongoose = require('mongoose');

const UnlockCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    generatedBy: { type: String, default: 'admin' },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false }
}, { timestamps: true });

// TTL Index for automatic deletion (optional, but code logic handles active check)
UnlockCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('UnlockCode', UnlockCodeSchema);
