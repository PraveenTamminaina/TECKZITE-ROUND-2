const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const users = await User.find({});
        console.log('--- USER DATA DEBUG ---');
        users.forEach(u => {
            console.log(`ID: ${u.teckziteId}`);
            console.log(`Round: ${u.currentRound}`);
            console.log(`Status: ${u.status}`);
            console.log(`Timings:`, u.timings);
            console.log('-----------------------');
        });
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugUsers();
