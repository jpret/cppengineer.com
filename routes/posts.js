
// Import libraries
const express = require('express');
const router = express.Router();
var moment = require('moment');
// Import middleware
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');
// Import models
const Post = require('../models/Post');

// @desc    Show add page
// @route   GET /posts/add
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('posts/add', {
        user: req.user,
        page: "New Post"
    });
});

// @desc    Process add a post
// @route   POST /post
router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Post.create(req.body);
        req.flash('success_msg', 'New Post created successfully!');
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.render('error/500');
    }
});

// @desc    Show all public posts
// @route   GET /posts
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('posts/index', {
            posts: posts,
            user: req.user,
            moment: moment,
            page: "Public Posts",
            helper: require('../helpers/helper')
        });

    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
});

// @desc    Get single post
// @route   GET /posts/:id
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id)
            .populate('user')
            .lean();
        if (!post) {
            return res.render('error/404');
        }
        res.render('posts/show', {
            post: post,
            moment: moment,
            user: req.user,
            page: "Post"
        });
    } catch (error) {
        console.log(error);
        res.render('error/404');
    }
});

// @desc    Edit a post
// @route   GET /posts/edit/:id

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Post.findOne({
            _id: req.params.id
        }).lean();

        if (!post) {
            return res.render('error/404');
        }

        if (post.user != req.user.id) {
            req.flash('error_msg', 'Sorry cannot edit that post, because you are not the owner of that post!');
            res.redirect('/dashboard');
        } else {
            res.render('posts/edit', {
                post,
                page: "Edit Post",
                user: req.user,
            })
        }
    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
});

// @desc    Update a post
// @route   PUT /stories/:id

router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id).lean()

        if (!post) {
            return res.render('error/404')
        }

        if (post.user != req.user.id) {
            req.flash('error_msg', 'Sorry cannot edit that post, because you are not the owner of that post!');
            res.redirect('/dashboard');
        } else {
            req.body.editedAt = Date.now();
            post = await Post.findOneAndUpdate({
                _id: req.params.id
            }, req.body, {
                new: true,
                runValidators: true
            })
            req.flash('success_msg', 'Post updated successfully!');
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
});

// @desc    Delete post
// @route   DELETE /posts/:id

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {

        let post = await Post.findById(req.params.id).lean()

        if (!post) {
            return res.render('error/404')
        }

        if (post.user != req.user.id) {
            req.flash('error_msg', 'Sorry cannot edit that post, because you are not the owner of that post!');
            res.redirect('/dashboard');
        } else {
            await Post.remove({ _id: req.params.id })
            req.flash('success_msg', 'Post removed successfully!');
            res.redirect('/dashboard')
        }
    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
});

// @desc    User posts
// @route   GET /posts/user/:userId
router.get('/user/:userId', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({
            user: req.params.userId,
            status: 'public',
        })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()

        res.render('posts/index', {
            posts: posts,
            user: req.user,
            moment: moment,
            page: `Public Posts: ${req.user.name}`,
            helper: require('../helpers/helper')
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router;