const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ teckziteId: 'TZ-1701' });
        if (user) {
            console.log('User Found:', {
                teckziteId: user.teckziteId,
                mobileNumber: user.mobileNumber,
                status: user.status
            });
        } else {
            console.log('User TZ-1701 not found');
            const allUsers = await User.find({}).limit(5);
            console.log('First 5 users:', allUsers.map(u => ({ tid: u.teckziteId, mob: u.mobileNumber })));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkUser();
