// jshint esversion:9

const Court = require("../models/court");
const Review = require("../models/review");

const { cloudinary } = require("../user-images");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const foundCourts = await Court.find({});
  res.render("./courts/index", { foundCourts });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./courts/new");
};

module.exports.createCourt = async (req, res, next) => {
  const geoData = await geocodingClient
    .forwardGeocode({
      query: req.body.court.location,
      limit: 1,
    })
    .send();
  const newCourt = new Court(req.body.court);
  newCourt.geometry = geoData.body.features[0].geometry;
  newCourt.author = req.user._id;
  newCourt.images = req.files.map((img) => ({
    url: img.path,
    filename: img.filename,
  }));
  await newCourt.save();
  req.flash("success", "New court added successfully!");
  res.redirect(`/courts/${newCourt._id}`);
};

module.exports.showCourt = async (req, res) => {
  const foundCourt = await Court.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!foundCourt) {
    req.flash("error", "Court not found.");
    return res.redirect("/courts");
  }
  res.render("./courts/show", { foundCourt });
};

module.exports.renderEditForm = async (req, res) => {
  const foundCourt = await Court.findById(req.params.id);
  if (!foundCourt) {
    req.flash("error", "Court not found.");
    return res.redirect("/courts");
  }
  res.render(`./courts/edit`, { foundCourt });
};

module.exports.updateCourt = async (req, res) => {
  const updatedCourt = await Court.findByIdAndUpdate(req.params.id, {
    ...req.body.court,
  });
  const newImages = req.files.map((img) => ({
    url: img.path,
    filename: img.filename,
  }));
  updatedCourt.images.push(...newImages);
  await updatedCourt.save();
  if (req.body.deleteImages) {
    // for (let filename of req.body.deleteImages) {                       //for deleting images from cloudinary. Disabled for now since I dont want to delete my seed images
    //   await cloudinary.uploader.destroy(filename);
    // }
    await updatedCourt.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Updated successfully.");
  res.redirect(`/courts/${updatedCourt._id}`);
};

module.exports.deleteCourt = async (req, res) => {
  const deletedCourt = await Court.findByIdAndDelete(req.params.id);
  await Review.deleteMany({ _id: { $in: deletedCourt.reviews } });
  req.flash("success", "Court deleted successfully.");
  res.redirect("/courts");
};
