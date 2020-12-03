const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'user',
        enum:['user','admin']
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: Date.now
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = User;