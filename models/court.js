// jshint esversion:9

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  //virtual property added to image schema to get the thumbnail size(adds /w_200 in the URL and cloudinary automatically gives 200 px image)
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } }; // need to include this option in the courtSchema for the virtuals to show when doc is converted to JSON

const courtSchema = new Schema(
  {
    title: String,
    description: String,
    price: Number,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    location: String,
    images: [ImageSchema],
    author: {
      type: Schema.Types.ObjectId, //reference to User Schema
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId, // reference to review Schema
        ref: "Review",
      },
    ],
  },
  opts
);

courtSchema.virtual("properties.popUpMarkup").get(function () {
  //Virtual property created for clustermap popup
  return `<strong><a href="/courts/${this._id}">${this.title}</a></strong>
    <p>${this.location}</p>`;
});

module.exports = new mongoose.model("Court", courtSchema);
