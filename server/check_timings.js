const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log("--- TIMINGS REPORT ---");
        users.forEach(u => {
            const g1 = u.timings ? u.timings.game1Time : 'N/A';
            const g2 = u.timings ? u.timings.game2Time : 'N/A';
            const start = u.timings ? u.timings.startTime : 'N/A';
            console.log(`ID: ${u.teckziteId} | G1: ${g1} | G2: ${g2} | Start: ${start}`);
        });
        console.log("----------------------");
        process.exit();
    } catch (err) { console.error(err); process.exit(1); }
};
debugUsers();
