const express = require('express');
const adminController = require('../controllers/admin.controller');
const verifyAdminToken = require('../middlewares/verifyAdminToken');
const adminAllowedTo = require('../middlewares/adminAllowedTo');
const { adminValidationSchema, createFirstAdminValidation } = require('../middlewares/adminValidation');

const router = express.Router();

//public routes 
router.route('/create-first-admin')
    .post(createFirstAdminValidation, adminController.createFirstAdmin);

router.route('/login')
    .post(adminController.login);

router.route('/check-email')
    .post(adminController.checkEmail);

//protected routes 
router.route('/')
    .get(verifyAdminToken, adminController.getAllAdmins)
    .post(
        verifyAdminToken, 
        adminAllowedTo('super_admin'), //only super_admin can create new admins
        adminValidationSchema, 
        adminController.createAdmin
    );

router.route('/:adminId')
    .get(verifyAdminToken, adminController.getAdmin)
    .patch(
        verifyAdminToken, 
        adminAllowedTo('super_admin'), //only super_admin can update admins by patch
        adminController.updateAdmin
    )
    .delete(
        verifyAdminToken, 
        adminAllowedTo('super_admin'), //only super_admin can delete admins
        adminController.deleteAdmin
    );

module.exports = router;
