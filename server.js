/**
 * File:    server.js
 * Desc:    This is the top-level script for the website.
 *          The server.js file is responsible for setting 
 *          up the server and the relevant routes.
 */

 /**
  * Section: Web framework app setup
  */

//Import express web framework
const express = require('express');

//Create the web application
const app = express();

/**
 * Section: Schemas and routes
 */

//Import the article model schema
const Article = require('./models/article');
//Import the article router
const articleRouter = require('./routes/articles');

/**
 * Section:  Database management
 */

//Import mongoose for database management
const mongoose= require('mongoose');

mongoose.connect("mongodb://localhost:27017/portfolio", {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true });

/**
 * Section: Application settings and route setup
 */

 //Set template view engine to EJS
app.set('view engine', 'ejs');

//Ensure we use the url encoder
app.use(express.urlencoded({extended:false}));

//Enable method override for PUT/DELETE etc. requests
const methodOverwrite = require('method-override');
app.use(methodOverwrite('_method'));

//Set the about route
app.get('/about', async (req,res) => {
    res.render('content/about',{
        page_name: 'about'
    });
});

app.get('/portfolio', async (req,res) => {
    res.render('content/portfolio',{
        page_name: 'portfolio'
    });
});

app.get('/contact', async (req,res) => {
    res.render('content/contact',{
        page_name: 'contact'
    });
});

//Set the articles route
app.use('/articles', articleRouter);

//Set the main route
app.get('/', async (req,res) => {
    const articles = await Article.find().sort({
        createdAt: 'desc'});
    res.render('articles/index', {
        articles:articles,
        page_name: 'home'
    });
});

//Startup the app and listen for requests
app.listen(5000);