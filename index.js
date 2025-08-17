require('dotenv').config();
const express = require('express');
const userRouter = require('./routes/user.route');
const adminRouter = require('./routes/admin.route'); 
const connection = require('./db/connection');
const path = require('node:path');

const app = express();

app.use(express.json());

// existing routes
app.use('/api/users', userRouter);

// add new admin routes
app.use('/api/admins', adminRouter);

// health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

//global error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

connection();

const PORT = process.env.PORT || 3000; // FIXED: removed extra semicolon

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log('API Endpoints:');
    console.log(`Users:  http://localhost:${PORT}/api/users`);
    console.log(`Admins: http://localhost:${PORT}/api/admins`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
});