// jshint esversion:9



const Court = require("./models/court");
const ExpressError = require('./utilities/ExpressError');
const { courtJoiSchema, reviewJoiSchema } = require('./joi-schemas');
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    const { id } = req.params;
    if (!req.isAuthenticated()) {
        req.session.returnToUrl = (req.query._method === 'DELETE' ? `/courts/${id}` : req.originalUrl);
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const foundSpot = await Court.findById(id);
    if (!foundSpot.author.equals(req.user._id)) {
        req.flash('error', 'You do have permission to do that.');
        return res.redirect(`/courts/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const foundReview = await Review.findById(reviewId);
    if (!foundReview.author.equals(req.user._id)) {
        req.flash('error', 'You do have permission to do that.');
        return res.redirect(`/courts/${id}`);
    }
    next();
};


module.exports.joiValidation = (req, res, next) => {
    const { error } = courtJoiSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(data => data.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
};

module.exports.reviewJoiValidation = (req, res, next) => {
    const { error } = reviewJoiSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(data => data.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
};
