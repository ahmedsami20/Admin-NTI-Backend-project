const { body } = require('express-validator');

const adminValidationSchema = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters')
        .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/).withMessage('Name can only contain letters and spaces'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and numbers'),
    
    body('role')
        .optional()
        .isIn(['super_admin', 'admin', 'moderator'])
        .withMessage('Invalid role'),
        
    body('phone')
        .optional()
        .matches(/^[\+]?[0-9\-\s\(\)]+$/)
        .withMessage('Invalid phone number'),
        
    body('department')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Department name too long')
];

const createFirstAdminValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

module.exports = {
    adminValidationSchema,
    createFirstAdminValidation
};