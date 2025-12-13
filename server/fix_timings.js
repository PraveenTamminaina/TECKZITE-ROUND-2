const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixTimings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        for (const u of users) {
             let changed = false;
             if (!u.timings.startTime) {
                 console.log(`Fixing start time for ${u.teckziteId}`);
                 // Default to createdAt or 20 mins ago
                 u.timings.startTime = u.createdAt; 
                 changed = true;
             }
             
             // Recalculate G1/G2 if they are 0 but status is 'completed'
             if (u.status === 'completed' && u.timings.game2Time === 0) {
                 console.log(`Fixing game times for completed user ${u.teckziteId}`);
                 const end = u.timings.endTime ? new Date(u.timings.endTime).getTime() : Date.now();
                 const start = new Date(u.timings.startTime).getTime();
                 const total = (end - start) / 1000;
                 
                 // Estimate split if missing (e.g. 50/50)
                 if (u.timings.game1Time === 0) u.timings.game1Time = Math.floor(total / 2);
                 u.timings.game2Time = Math.floor(total - u.timings.game1Time);
                 changed = true;
             }
             
             if (changed) await u.save();
        }
        console.log("Fixes applied.");
        process.exit();
    } catch (err) { console.error(err); process.exit(1); }
};
fixTimings();
