require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Admin = require('./models/Admin');
const UnlockCode = require('./models/UnlockCode');

const finalSetup = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // 1. Clear Players
        console.log('Cleaning up player data...');
        await User.deleteMany({});
        await UnlockCode.deleteMany({});
        console.log('✅ All player data and codes cleared.');

        // 2. Setup Admin
        const username = 'admin';
        const password = 'TeckziteMasterKey2025!';

        const existingAdmin = await Admin.findOne({ username });
        
        if (existingAdmin) {
            console.log('Admin account found. Updating password to default...');
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(password, salt);
            await existingAdmin.save();
            console.log('✅ Admin credentials updated.');
        } else {
            console.log('Creating fresh Admin account...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            await Admin.create({
                username,
                password: hashedPassword
            });
            console.log('✅ Admin account created.');
        }

        console.log('\n--- SETUP COMPLETE ---');
        console.log('System is ready for the event.');
        console.log(`Admin Login: ${username}`);
        console.log(`Admin Password: ${password}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Setup Failed:', error.message);
        if (error.message.includes('buffering timed out') || error.message.includes('MongooseServerSelectionError')) {
             console.error('\n!!! CRITICAL ERROR: IP ADDRESS NOT WHITELISTED !!!');
             console.error('Please go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0)');
        }
        process.exit(1);
    }
};

finalSetup();
