
// Imports - Libraries
const express = require('express');
const router = express.Router();
var moment = require('moment');
// Imports - Middleware
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');
// Imports - Models
const Post = require('./../models/Post');

// @desc    Landing page
// @route   GET /
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .limit(5)
            .lean()
        res.render('index', {
            posts: posts,
            moment: moment,
            basePath: "blog",
            helper: require('../helpers/helper')
        });
  
    } catch (error) {
        console.error(error);
        res.render('error/404', {
          redirect:"/"
      });
    }
  });

// @desc    About page
// @route   GET /about
router.get('/about', (req, res) => {
    res.render('about');
});

// @desc    Member dashboard page
// @route   GET /about
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()
    res.render('dashboard', {
      user: req.user,
      posts:posts,
      moment:moment,
      layout: 'layouts/main_user'
    });

} catch (error) {
    console.error(error);
    res.render('error/500', {
        redirect:"/"
    });
}
});

module.exports = router;