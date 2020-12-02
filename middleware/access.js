module.exports = {
    checkEnvironmentAccess: function (req, res, next) {
        if (process.env.REGISTER_OPEN == false &&
            req.url == '/users/register') {
            req.flash('error_msg', 'Registration not allowed');
            res.redirect('/users/login');
        } else {
            return next();
        }
    }
};