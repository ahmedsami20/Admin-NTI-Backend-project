const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

const verifyAdminToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers['Authorization'];
        
        if (!authHeader) {
            return res.status(400).json({ message: 'Forbidden - No token provided' });
        }

        //extract token 
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(400).json({ message: 'Forbidden - Invalid token format' });
        }

        //verify token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        //find admin
        const admin = await Admin.findById(decoded.id);
        
        if (!admin || !admin.isActive) {
            return res.status(400).json({ message: 'Admin not found or inactive' });
        }

        //add admin info to request 
        req.adminId = admin._id;
        req.adminRole = admin.role;
        req.adminPermissions = admin.permissions;

        next();

    } catch (error) {
        console.error('Admin auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid token' });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Token expired' });
        }

        res.status(500).json({ message: 'Server error in authentication' });
    }
};

module.exports = verifyAdminToken;