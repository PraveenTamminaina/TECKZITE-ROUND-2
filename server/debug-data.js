const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        users.forEach(u => {
            console.log(`User: ${u.teckziteId}`);
            if (u.timings) {
                console.log(`  G1: ${u.timings.game1Time}`);
                console.log(`  G2: ${u.timings.game2Time}`);
                console.log(`  Start: ${u.timings.startTime}`);
                console.log(`  End: ${u.timings.endTime}`);
            } else {
                console.log('  No timings object');
            }
        });
        process.exit();
    } catch (err) { console.error(err); process.exit(1); }
};
debugUsers();
