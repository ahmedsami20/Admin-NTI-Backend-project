const adminAllowedTo = (...roles) => {
    return (req, res, next) => {
        
        //check if admin role is in allowed roles
        if (roles.includes(req.adminRole)) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
        }
    };
};

module.exports = adminAllowedTo;