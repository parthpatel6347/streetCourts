// jshint esversion:9

const Review = require("../models/review");
const Court = require("../models/court");

//POST route for creating review
module.exports.createReview = async (req, res) => {
  const foundCourt = await Court.findById(req.params.id);
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  foundCourt.reviews.push(newReview);
  await newReview.save();
  await foundCourt.save();
  req.flash("success", "Review added.");
  res.redirect(`/courts/${foundCourt._id}`);
};

//Delete route for deleteing review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Court.findByIdAndUpdate(id, { $pull: { review: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review removed.");
  res.redirect(`/courts/${id}`);
};
