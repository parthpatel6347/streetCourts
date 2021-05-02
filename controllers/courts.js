// jshint esversion:9

const Court = require("../models/court");
const Review = require("../models/review");

const { cloudinary } = require("../user-images");

//mapbox requires
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

//GET req for index page
module.exports.index = async (req, res) => {
  const foundCourts = await Court.find({}); //finds all courts in mongoDB
  res.render("./courts/index", { foundCourts }); //render index and pass the found courts to the index template
};

//GET req for new court form
module.exports.renderNewForm = (req, res) => {
  res.render("./courts/new");
};

//POST route for creating new court
module.exports.createCourt = async (req, res, next) => {
  //get the geo data from the court location
  const geoData = await geocodingClient
    .forwardGeocode({
      query: req.body.court.location,
      limit: 1,
    })
    .send();
  const newCourt = new Court(req.body.court); //create new court with form data
  newCourt.geometry = geoData.body.features[0].geometry;
  newCourt.author = req.user._id;
  newCourt.images = req.files.map((img) => ({
    url: img.path,
    filename: img.filename,
  }));
  await newCourt.save();
  req.flash("success", "New court added successfully!");
  res.redirect(`/courts/${newCourt._id}`); //redirect to court show page
};

//GET route for show page
module.exports.showCourt = async (req, res) => {
  const foundCourt = await Court.findById(req.params.id) //finds the requested court by id and populates reviews, review authors and court author
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

//GET req for court edit form
module.exports.renderEditForm = async (req, res) => {
  const foundCourt = await Court.findById(req.params.id);
  if (!foundCourt) {
    req.flash("error", "Court not found.");
    return res.redirect("/courts");
  }
  res.render(`./courts/edit`, { foundCourt });
};

//POST req for update court
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

//Delete req
module.exports.deleteCourt = async (req, res) => {
  const deletedCourt = await Court.findByIdAndDelete(req.params.id);
  await Review.deleteMany({ _id: { $in: deletedCourt.reviews } });
  req.flash("success", "Court deleted successfully.");
  res.redirect("/courts");
};
