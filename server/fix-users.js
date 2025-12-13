const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const resetUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const result = await User.updateMany(
            {}, 
            { 
                $set: { 
                    status: 'active',
                    'violations.tabSwitchCount': 0 
                } 
            }
        );
        
        console.log(`Reset ${result.modifiedCount} users to Active status.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetUsers();
