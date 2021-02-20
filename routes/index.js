
// Imports - Libraries
const express = require('express');
const router = express.Router();
var moment = require('moment');

// Imports - Middleware
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');
const { sendEmail } = require('../middleware/email');
const { verifyReCapthca } = require('../middleware/recaptcha');
// Imports - Models
const Post = require('./../models/Post');
const ContactMessage = require('../models/ContactMessage');

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
            redirect: "/"
        });
    }
});

// @desc    About page
// @route   GET /about
router.get('/about', (req, res) => {
    res.render('about');
});

// @desc    Show Contact page
// @route   GET /contact
router.get('/contact', (req, res) => {
    res.render('contact');
});

// @desc    Submit Contact Message
// @route   POST /contact
router.post('/contact', async (req, res) => {
    try {
        if (req.body.name.length > 100) {
            res.render("contact", {
                error_msg: "That name is too long...",
                name: req.body.name,
                email: req.body.email,
                messageContent: req.body.body
            });
        } else if (req.body.email.length > 100) {
            res.render("contact", {
                error_msg: "That email is too long...",
                name: req.body.name,
                email: req.body.email,
                messageContent: req.body.body
            });
        } else if (req.body.body.length > 3500) {
            res.render("contact", {
                error_msg: "That message is too long...",
                name: req.body.name,
                email: req.body.email,
                messageContent: req.body.body
            });
        } else {
            // Get the user recaptcha
            const userRecaptcha = req.body['g-recaptcha-response'];
            if (userRecaptcha.length > 0) {
                let challengeResult = await verifyReCapthca(userRecaptcha);
                // Verify Recaptcha
                if (challengeResult.success == false) {
                    res.render("contact", {
                        error_msg: "Are you a robot?... please try the reCAPTCHA again",
                        name: req.body.name,
                        email: req.body.email,
                        messageContent: req.body.body
                    });
                } else if (challengeResult.success == true) {
                    const contactMessage = await ContactMessage.create(req.body);
                    sendEmail(contactMessage);
                    req.flash('success_msg', "Contact Message received successfully! I'll get back to you as soon as possible.");
                    res.redirect('/');
                } else {
                    res.render('error/500', {
                        redirect: "/"
                    });
                }
            } else {
                res.render("contact", {
                    error_msg: "Please click in the reCAPTCHA box to prove that you are human!",
                    name: req.body.name,
                    email: req.body.email,
                    messageContent: req.body.body
                });
            }
        }
    } catch (error) {
        console.log(error);
        res.render('error/500', {
            redirect: "/"
        });
    }
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
            posts: posts,
            moment: moment,
            layout: 'layouts/main_user'
        });

    } catch (error) {
        console.error(error);
        res.render('error/500', {
            redirect: "/"
        });
    }
});

module.exports = router;