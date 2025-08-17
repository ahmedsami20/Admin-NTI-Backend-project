require('dotenv').config(); 
const Admin = require('../models/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}, { '__v': false, 'password': false });
        res.status(200).json(admins);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create first admin - FIXED MULTIPLE ERRORS
const createFirstAdmin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(400).json({ success: false, message: 'Admins already exist in the system' });
        }

        const { name, email, password } = req.body;

        const firstAdmin = await Admin.createAdmin({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: 'super_admin'
        });

        const token = jwt.sign(
            { id: firstAdmin._id, role: 'super_admin' },
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'First admin created successfully',
            admin: firstAdmin,
            token: token
        });

    } catch (error) {
        console.error('First admin creation error:', error);

        if (error.message.includes('already exists')) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        res.status(500).json({ success: false, message: 'Error creating first admin', error: error.message });
    }
};

// Admin login - FIXED CRITICAL ERROR
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

        if (!admin) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const comparedPassword = await admin.comparePassword(password);

        if (admin && comparedPassword) {
            if (!admin.isActive) {
                return res.status(400).json({ message: 'Account is deactivated' });
            }

            const token = jwt.sign(
                { id: admin._id, role: admin.role },
                process.env.JWT_SECRET_KEY, 
                { expiresIn: '24h' }
            );

            admin.lastLogin = new Date();
            await admin.save();

            res.status(200).json({
                message: 'Logged in successfully',
                token: token,
                admin: admin.toSafeObject()
            });
        } else {
            res.status(400).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create new admin - FIXED MULTIPLE ERRORS
const createAdmin = async (req, res) => {
    try {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

        const { name, email, password, role, phone, department } = req.body;

        const newAdminData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: role || 'admin',
            createdBy: req.adminId
        };

        if (phone) newAdminData.phone = phone.trim();
        if (department) newAdminData.department = department.trim();

        const newAdmin = await Admin.createAdmin(newAdminData);

        const token = jwt.sign(
            { id: newAdmin._id, role: newAdmin.role },
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin: newAdmin
        });

        console.log(`New admin created: ${newAdmin.email}`);

    } catch (error) {
        console.error('Create admin error:', error);

        if (error.message.includes('already exists')) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get single admin
const getAdmin = async (req, res) => {
    try {
        const id = req.params.adminId;
        const foundAdmin = await Admin.findById(id, { '__v': false, 'password': false });

        if (!foundAdmin) {
            return res.status(404).json({ error: 'Admin Not Found' });
        }

        res.status(200).json(foundAdmin);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update admin
const updateAdmin = async (req, res) => {
    try {
        const id = req.params.adminId;
        const updateData = { ...req.body };
        delete updateData.password;

        const foundAdmin = await Admin.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        if (!foundAdmin) {
            return res.status(404).json({ error: 'Admin Not Found' });
        }

        res.status(200).json({ message: 'Updated Successfully', admin: foundAdmin.toSafeObject() });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete admin
const deleteAdmin = async (req, res) => {
    try {
        const id = req.params.adminId;
        const adminToDelete = await Admin.findById(id);
        if (adminToDelete && adminToDelete.role === 'super_admin') {
            return res.status(400).json({ error: 'Cannot delete super admin' });
        }

        await Admin.deleteOne({ _id: id });
        res.status(200).json({ message: 'Deleted Successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Check email availability
const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });

        res.json({
            success: true,
            available: !existingAdmin,
            message: existingAdmin ? 'Email already taken' : 'Email is available'
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getAllAdmins,
    createFirstAdmin,
    login,
    createAdmin,
    getAdmin,
    updateAdmin,
    deleteAdmin,
    checkEmail
};