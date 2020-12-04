module.exports = {
    checkEnvironmentAccess: function (req, res, next) {
        if (process.env.REGISTER_OPEN == "true" &&
            req.url == '/register') {
            return next();
        } else if (process.env.REGISTER_OPEN != "true" &&
            req.url == '/register') {
            req.flash('error_msg', 'Registration not yet allowed');
            res.redirect('/users/login');
        }
    }
};