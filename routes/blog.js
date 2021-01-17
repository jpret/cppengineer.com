
// Imports - Libraries
const express = require('express');
const router = express.Router();
var moment = require('moment');
const showdown = require('showdown');
// Imports - Middleware
// None
// Imports - Models
const Post = require('./../models/Post');

// @desc    Blogs index page
// @route   GET /blog
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('blog/index', {
            posts: posts,
            moment: moment,
            basePath: "blog",
            filter : "",
            helper: require('../helpers/helper')
        });
  
    } catch (error) {
        console.error(error);
        res.render('error/500', {
          redirect:"/"
      });
    }
  });

// @desc    Get single published post
// @route   GET /blog/:id
router.get('/:id', async (req, res) => {
    try {
        let post = await Post.findById(req.params.id)
            .populate('user')
            .lean();
        if (!post) {
            return res.render('error/404', {
                redirect:"/"
            });
        }
        if (post.status != 'public') {
            return res.render('error/404', {
                redirect:"/"
            });
        }
        var converter = new showdown.Converter();
        post.body = converter.makeHtml(post.body);
        res.render('blog/post', {
            post: post,
            moment: moment,
            basePath: "blog",
            name: post.user.name
        });
    } catch (error) {
        console.log(error);
        res.render('error/404', {
            redirect:"/"
        });
    }
});

// @desc    User posts
// @route   GET /blog/user/:userId
router.get('/user/:userId', (req, res) => {
    res.redirect('/blog')
})

module.exports = router;