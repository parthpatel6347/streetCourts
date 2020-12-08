// jshint esversion:9

const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('auth/register');
};

module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({
            email,
            username
        });
        const regUser = await User.register(newUser, password);
        req.login(regUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to streetCourts');
            res.redirect('/courts');
        });
    } catch (e) {
        if (e.keyPattern) {
            req.flash('error', 'A user with the given email is already registered.');
        } else {
            req.flash('error', e.message);
        }
        res.redirect('/register');
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('auth/login');
};

module.exports.loginPostRoute = (req, res) => {
    req.flash('success', 'Logged in successfully');
    const redirectUrl = req.session.returnToUrl || '/courts';
    delete req.session.returnToUrl;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged out successfully.');
    res.redirect('/login');
};