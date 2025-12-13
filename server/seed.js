require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seed'))
    .catch(err => {
        console.error('Connection Error', err);
        process.exit(1);
    });

const seedUsers = [
    { teckziteId: 'TZ-001', mobileNumber: '9999999991', name: 'Alice' },
    { teckziteId: 'TZ-002', mobileNumber: '9999999992', name: 'Bob' },
    { teckziteId: 'TZ-003', mobileNumber: '9999999993', name: 'Charlie' }
];

const importData = async () => {
    try {
        await User.deleteMany(); // Clear existing
        await User.insertMany(seedUsers);
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error('Error with data import', error);
        process.exit(1);
    }
};

importData();
