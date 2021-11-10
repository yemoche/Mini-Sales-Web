const mongoose = require('mongoose');
const { isEmail } = require('validator')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter an email"], //mongoose validation
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [5, "minimum password length is 5 characters"],
    },
    name: {
        type: String,
        required: true,
    },
});

//Hash user password using mongoose hook
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(6);
    this.password = await bcrypt.hash(this.password, salt);
    next()
})

const User = mongoose.model('user', userSchema)

module.exports = User;