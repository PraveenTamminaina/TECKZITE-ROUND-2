const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const testUser = {
            teckziteId: "TZ001",
            mobileNumber: "1234567890",
            name: "Test Player",
            status: "active",
            currentRound: "instructions"
        };
        
        // Delete if exists first
        await User.deleteOne({ teckziteId: testUser.teckziteId });
        
        await User.create(testUser);
        console.log("Test User Created:");
        console.log("ID:", testUser.teckziteId);
        console.log("Mobile:", testUser.mobileNumber);
        
        process.exit();
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
};

createTestUser();
