module.exports = {
    checkEnvironmentAccess: function (req, res, next) {
        console.log(process.env.REGISTER_OPEN);
        if (process.env.REGISTER_OPEN == "false" &&
            req.url == '/register') {
            req.flash('error_msg', 'Registration not yet allowed');
            res.redirect('/users/login');
        } else {
            return next();
        }
    }
};