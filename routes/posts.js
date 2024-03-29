
// Import libraries
const express = require('express');
const router = express.Router();
var moment = require('moment');
const helper = require('../helpers/helper');
const showdown = require('showdown');
// Import middleware
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');
// Import models
const Post = require('../models/Post');

// @desc    Show add page
// @route   GET /posts/add
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('posts/add', {
        user: req.user,
        layout: 'layouts/main_user'
    });
});

// @desc    Process add a post
// @route   POST /post
router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        req.body.user = req.user.id;
        req.body.tags = helper.stringArrayToJsArray(req.body.tags, ";");
        await Post.create(req.body);
        req.flash('success_msg', 'New Post created successfully!');
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.render('error/500', {
            redirect: "/dashboard"
        });
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
            return res.render('error/404', {
                redirect: "/dashboard"
            });
        }

        if (post.user != req.user.id) {
            req.flash('error_msg', 'Sorry cannot edit that post, because you are not the owner of that post!');
            res.redirect('/dashboard');
        } else {
            res.render('posts/edit', {
                post,
                layout: 'layouts/main_user',
                user: req.user,
            })
        }
    } catch (error) {
        console.error(error);
        res.render('error/500', {
            redirect: "/dashboard"
        });
    }
});

// @desc    Update a post
// @route   PUT /posts/:id
router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id).lean()

        if (!post) {
            return res.render('error/404', {
                redirect: "/dashboard"
            })
        }

        if (post.user != req.user.id) {
            req.flash('error_msg', 'Sorry cannot edit that post, because you are not the owner of that post!');
            res.redirect('/dashboard');
        } else {
            req.body.editedAt = Date.now();
            req.body.tags = helper.stringArrayToJsArray(req.body.tags, ";");
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
        res.render('error/500', {
            redirect: "/dashboard"
        });
    }
});

// @desc    Delete post
// @route   DELETE /posts/:id
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {

        let post = await Post.findById(req.params.id).lean()

        if (!post) {
            return res.render('error/404', {
                redirect: "/dashboard"
            })
        }

        if (post.user != req.user.id) {
            req.flash('error_msg', 'Sorry cannot edit that post, because you are not the owner of that post!');
            res.redirect('/dashboard');
        } else {
            await Post.deleteOne({ _id: req.params.id })
            req.flash('success_msg', 'Post removed successfully!');
            res.redirect('/dashboard')
        }
    } catch (error) {
        console.error(error);
        res.render('error/500', {
            redirect: "/dashboard"
        });
    }
});

// @desc    User posts
// @route   GET /posts/user/:userId
router.get('/user/:userId', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({
            user: req.params.userId,
            status: { "$in": ["public", "protected"] },
        })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()

        if (!posts) {
            res.render('error/404', {
                redirect: "/dashboard"
            })
        }
        const userName = posts[0].user.name;
        res.render('posts/index', {
            posts: posts,
            basePath: "posts",
            user: req.user,
            moment: moment,
            filter: userName,
            layout: 'layouts/main_user',
            helper: require('../helpers/helper')
        })
    } catch (err) {
        console.error(err)
        res.render('error/500', {
            redirect: "/dashboard"
        })
    }
});

// @desc    Get Json Backup of Posts
// @route   GET /posts/backup
router.get('/backup', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({
            user: req.user.id
        }).sort({ createdAt: 'desc' }).lean();

        if (!posts) {
            res.render('error/404', {
                redirect: "/dashboard"
            })
        }
        res.status(200).send(posts);
    } catch (err) {
        console.error(err)
        res.render('error/500', {
            redirect: "/dashboard"
        })
    }
});


// @desc    Get single post by id / slug
// @route   GET /posts/:id
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        var query = {$or: [{slug: req.params.id}]};
        // Check if it is a valid id, then only push id
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            query.$or.push({_id: req.params.id});
        }
        let post = await Post.findOne(query)
            .populate('user')
            .lean();
        if (!post) {
            return res.render('error/404', {
                redirect: "/dashboard"
            });
        }
        var converter = new showdown.Converter();
        post.body = converter.makeHtml(post.body);
        res.render('posts/show', {
            post: post,
            moment: moment,
            user: req.user,
            basePath: "posts",
            layout: 'layouts/main_user'
        });
    } catch (error) {
        console.log(error);
        res.render('error/404', {
            redirect: "/dashboard"
        });
    }
});


// @desc    Show all public / member posts
// @route   GET /posts
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({ status: { "$in": ["public", "protected"] } })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('posts/index', {
            posts: posts,
            user: req.user,
            moment: moment,
            filter: "",
            basePath: "posts",
            layout: 'layouts/main_user',
            helper: require('../helpers/helper')
        });

    } catch (error) {
        console.error(error);
        res.render('error/500', {
            redirect: "/dashboard"
        });
    }
});

module.exports = router;