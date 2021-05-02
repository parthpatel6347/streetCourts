const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId, //referenced to user schema
    ref: "User",
  },
});

module.exports = new mongoose.model("Review", reviewSchema);
