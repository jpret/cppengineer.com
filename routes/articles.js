/**
 * File:    articles.js
 * Desc:    This is the top-level srcipt for the article APIs.
 *          The apis are responsible for the relevant CRUD functions for
 *          articles
 */

 /**
  * Section: Imports
  */

//Import express web framework
const express = require('express');

//Set our router to the express module
const router = express.Router();

/**
 * Section: Schemas and routes
 */

//Import the article model schema
const Article = require('./../models/article');

/**
 * Section: routes
 */

//NEW: Post a new article
router.post('/', async (req,res, next) => {
    req.article = new Article();
    next();
}, saveArticleAndRedirect('new'));

//NEW: Render the NEW article edit page
router.get('/new',(req,res) => {
    res.render('articles/new', { 
        article: new Article(),
        page_name: 'new'
    });
});

//EDIT: Edit an existing article
router.get('/edit/:id', async(req,res) => {
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', { 
        article: article,
        page_name: 'edit'
    });
});
//EDIT: Put the changes to the article
router.put('/:id', async (req,res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect('edit')); 


//VIEW: Get an existing article by slug
router.get('/:slug', async (req,res) => {
    const article = await Article.findOne({slug: req.params.slug});
    if(article==null) res.redirect('/');
    res.render('articles/show', {
        article:article,
        page_name: 'show'
    });
});

//DELETE: Delete an existing article
router.delete('/:id', async(req,res) => {
    const article = await Article.findByIdAndDelete(req.params.id);
    res.redirect('/');
});


/**
 * Section: Functions
 */

 //Save the article and redirect to the article
function saveArticleAndRedirect(path){
    return async (req,res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;
        try{
            article = await article.save();
            res.redirect(`/articles/${article.slug}`);
        }catch(e){
            console.log(e);
            res.render(`articles/${path}`, { 
                article:article,
                page_name: "${path}"
            });
        } 
    }
}
module.exports = router;