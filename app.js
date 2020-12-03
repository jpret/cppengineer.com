
// Imports
const dotenv = require('dotenv');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)
const methodOverride = require('method-override');

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
app.set('layout', 'layouts/main.ejs');
app.set('view engine', 'ejs');


// Enable Bodyparser
app.use(express.urlencoded({ extended: false }))

// Method-override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Express session
app.use(
    session({
      secret: 'my super secret for CppEngineer',
      resave: true,
      saveUninitialized: true,
      store: new MongoStore({ mongooseConnection: mongoose.connection })
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