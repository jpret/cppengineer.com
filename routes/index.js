
// Imports - Libraries
const express = require('express');
const router = express.Router();
var moment = require('moment');
// Imports - Middleware
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');
// Imports - Models
const Post = require('./../models/Post');

// @desc    Static landing page
// @route   GET /
router.get('/', (req, res) => {
  const posts = [{
    title: "Hello World Post!",
    section: "Software",
    brief: "This is the hello world post's brief",
    body: "This is the test post for the index page!",
    imagePath: "/1.0/img/cpp.png",
    status: "private",
    createdAt: Date.now()
  },
  {
    title: "This is a Second Post!",
    section: "C++20",
    brief: "This is the second post's brief",
    body: "We're going places! Blah Blah Blah!",
    imagePath: "/1.0/img/cpp.png",
    status: "private",
    createdAt: Date.now()
  }];
  res.render('index', {
    posts: posts,
    moment: moment
  });
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

module.exports = router;