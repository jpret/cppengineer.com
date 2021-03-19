const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    status: {
        type: String,
        default: 'private',
        enum: ['public', 'protected', 'private']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    editedAt: {
        type: Date,
        default: Date.now
    },
    slug: { 
        type: String, 
        slug: "title",
        unique: true
    }
})

module.exports = mongoose.model('Post', PostSchema);