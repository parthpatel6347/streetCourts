// jshint esversion:9

const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const auth = require('../controllers/auth');

router.route('/register')
    .get(auth.renderRegisterForm)
    .post(catchAsync(auth.registerUser));

router.route('/login')
    .get(auth.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), auth.loginPostRoute);

router.get('/logout', auth.logout);

module.exports = router;