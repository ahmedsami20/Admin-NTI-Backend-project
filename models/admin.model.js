const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require('validator');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, validate: [isEmail, 'Invalid email'] },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['super_admin', 'admin', 'moderator'], default: 'admin' },
  permissions: { type: Object, default: {} },
  isActive: { type: Boolean, default: true },
  phone: { type: String, trim: true },
  department: { type: String, trim: true, maxlength: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  lastLogin: { type: Date },
  token: String
}, { timestamps: true });

adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });

//hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

//compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

//get safe object without password and token - IMPROVED
adminSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.token;     // ✅ ADDED: Remove token from safe object for security
  delete obj.__v;
  return obj;
};

//create new admin
adminSchema.statics.createAdmin = async function(adminData) {
  const existingAdmin = await this.findOne({ email: adminData.email });
  if (existingAdmin) throw new Error('Admin with this email already exists');

  //default permissions based on role
  if (!adminData.permissions) {
    if (adminData.role === 'super_admin') {
      adminData.permissions = {
        users: { read: true, write: true, delete: true },
        bookings: { read: true, write: true, delete: true },
        fields: { read: true, write: true, delete: true },
        courses: { read: true, write: true, delete: true },
        admins: { read: true, write: true, delete: true }
      };
    } else if (adminData.role === 'admin') {  // ✅ ADDED: Missing default permissions for 'admin' role
      adminData.permissions = {
        users: { read: true, write: true, delete: false },
        bookings: { read: true, write: true, delete: true },
        fields: { read: true, write: true, delete: false },
        courses: { read: true, write: true, delete: false },
        admins: { read: true, write: false, delete: false }
      };
    } else if (adminData.role === 'moderator') {
      adminData.permissions = {
        users: { read: true, write: false, delete: false },
        bookings: { read: true, write: true, delete: false },
        fields: { read: true, write: false, delete: false },
        courses: { read: true, write: false, delete: false },
        admins: { read: false, write: false, delete: false }
      };
    }
  }

  const newAdmin = new this(adminData);
  await newAdmin.save(); 
  return newAdmin; //mongoose document 
};

module.exports = mongoose.model('Admin', adminSchema);