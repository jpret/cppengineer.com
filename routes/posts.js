
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
    res.render('posts/add');
});

// @desc    Process add a post
// @route   POST /post
router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Post.create(req.body);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.render('error/500');
    }
});

// @desc    Show all posts
// @route   GET /posts
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        console.log(posts);
        res.render('posts/index', {
            posts
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
            moment: moment
        });
    } catch (error) {
        console.log(error);
        res.render('error/404');
    }
});

// @desc    Show all stories
// @route   GET /stories/edit/:id

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id
        }).lean();

        if (!story) {
            return res.render('error/404');
        }

        if (story.user != req.user.id) {
            res.redirect('/stories');
        } else {
            res.render('stories/edit', {
                story
            })
        }
    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
});

// @desc    Update story
// @route   PUT /stories/:id

router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories');
        } else {
            story = await Story.findOneAndUpdate({
                _id: req.params.id
            }, req.body, {
                new: true,
                runValidators: true
            })
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
});

// @desc    Delete story
// @route   DELETE /stories/:id

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        await Story.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
});

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuthenticated, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public',
        })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()

        res.render('stories/index', {
            stories,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router;