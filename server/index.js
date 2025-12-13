require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        return callback(null, true);
    },
    credentials: true
}));
app.use(cookieParser());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/game', require('./routes/gameRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Global Server Error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Serve static files from the React app
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV !== 'test') { // Adjust condition as needed
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Teckzite Round 2 API Running (Dev Mode)');
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
