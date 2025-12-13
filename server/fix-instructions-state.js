const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Find users who are in 'game1' but haven't started (no startTime)
        // These are the ones who were skipped past instructions
        const result = await User.updateMany(
            { currentRound: 'game1', 'timings.startTime': { $exists: false } },
            { $set: { currentRound: 'instructions' } }
        );

        console.log(`Updated ${result.modifiedCount || 0} users to 'instructions' state.`);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

fixUsers();
