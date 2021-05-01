// jshint esversion:9

const express = require("express");
const router = express.Router();

const courts = require("../controllers/courts");

const catchAsync = require("../utilities/catchAsync");
const { isLoggedIn, isAuthor, joiValidation } = require("../middleware");

//image upload/delete requires
const multer = require("multer");
const { storage } = require("../user-images");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(courts.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    joiValidation,
    catchAsync(courts.createCourt)
  );

router.get("/new", isLoggedIn, courts.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(courts.showCourt))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    joiValidation,
    catchAsync(courts.updateCourt)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(courts.deleteCourt));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(courts.renderEditForm)
);

module.exports = router;
