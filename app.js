
// Imports
const dotenv = require('dotenv');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

// Environment Constants
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 3000;

// Create express app
const app = express();

// Passport config
require('./middleware/passport')(passport);

// Import Middleware
const connectDB = require('./middleware/db');

// Connect DB
connectDB();

// Set view engine - EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Enable Bodyparser
app.use(express.urlencoded({ extended: false }))

// Express session
app.use(
    session({
      secret: 'my super secret',
      resave: true,
      saveUninitialized: true
    })
  );

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));

// Static folder files
app.use(express.static('assets'));

// Start server
app.listen(
    PORT,'localhost',
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);