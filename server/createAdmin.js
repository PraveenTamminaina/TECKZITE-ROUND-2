require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seed');

        const username = 'admin';
        const password = 'TeckziteMasterKey2025!';

        // Check if admin exists
        const existingAdmin = await Admin.findOne({ username });
        
        if (existingAdmin) {
            console.log('Admin already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(password, salt);
            await existingAdmin.save();
            console.log('Admin password updated.');
        } else {
            console.log('Creating new admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            await Admin.create({
                username,
                password: hashedPassword
            });
            console.log('Admin created successfully.');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
