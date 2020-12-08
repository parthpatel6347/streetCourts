// jshint esversion:9

const express = require('express');
const router = express.Router({ mergeParams: true });

const reviews = require('../controllers/reviews');

const catchAsync = require('../utilities/catchAsync');
const { reviewJoiValidation, isLoggedIn, isReviewAuthor } = require('../middleware');


router.post("/", isLoggedIn, reviewJoiValidation, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;