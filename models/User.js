const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        phone: {
            type: String,
            default: ''
        },
        address: {
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            zip: { type: String, default: '' },
            country: { type: String, default: '' }
        },
        refreshToken: {
            type: String,
            select: false
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;