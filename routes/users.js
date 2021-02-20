
// Import - Libraries
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Import - Middleware
const { forwardAuthenticated } = require('../middleware/auth');
const { checkEnvironmentAccess } = require('../middleware/access');
const { verifyReCapthca } = require('../middleware/recaptcha');

// Import - Models
const User = require('../models/User');

// @desc    User Login page
// @route   GET /users/login
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('users/login', { layout: 'layouts/lean' })
});

// @desc    User Register page
// @route   GET /users/login
router.get('/register',
  checkEnvironmentAccess,
  forwardAuthenticated, (req, res) => {
    res.render('users/register', { layout: 'layouts/lean' })
  });

// Register
router.post('/register', checkEnvironmentAccess, (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors,
      name,
      email,
      password,
      password2,
      layout: 'layouts/lean'
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('users/register', {
          errors,
          name,
          email,
          password,
          password2,
          layout: 'layouts/lean'
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  if (process.env.NODE_ENV == "production") {
    // Get the user recaptcha
    const userRecaptcha = req.body['g-recaptcha-response'];
    if (userRecaptcha.length > 0) {
      let challengeResult = await verifyReCapthca(userRecaptcha);
      // Verify Recaptcha
      if (challengeResult.success == false) {
        res.render('users/login', {
          layout: 'layouts/lean',
          error_msg: "Are you a robot?... please try the reCAPTCHA again"
        })
      } else if (challengeResult.success == true) {
        passport.authenticate('local', {
          successRedirect: '/dashboard',
          failureRedirect: '/users/login',
          failureFlash: true
        })(req, res, next);
      } else {
        res.render('error/500', {
          redirect: "/"
        });
      }
    } else {
      res.render('users/login', {
        layout: 'layouts/lean',
        error_msg: "Please click in the reCAPTCHA box to prove that you are human!"
      })
    }
  } else if (process.env.NODE_ENV == "development") {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  };

});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;