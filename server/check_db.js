const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log("COUNT:", users.length);
        users.forEach(u => {
            console.log("USER_START");
            console.log(JSON.stringify(u.toObject(), null, 2));
            console.log("USER_END");
        });
        process.exit();
    } catch (err) { console.error(err); process.exit(1); }
};
debugUsers();
