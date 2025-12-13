const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const randomizeTimings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ status: 'completed' });
        
        for (const u of users) {
             const total = (u.timings.game1Time || 0) + (u.timings.game2Time || 0);
             if (total > 0) {
                 // Randomize split between 30% and 70%
                 const ratio = 0.3 + (Math.random() * 0.4); 
                 const newG1 = Math.floor(total * ratio);
                 const newG2 = total - newG1;
                 
                 u.timings.game1Time = newG1;
                 u.timings.game2Time = newG2;
                 
                 console.log(`Updated ${u.teckziteId}: ${newG1}s / ${newG2}s`);
                 await u.save();
             }
        }
        console.log("Randomization applied.");
        process.exit();
    } catch (err) { console.error(err); process.exit(1); }
};
randomizeTimings();
