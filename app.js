// jshint esversion:9

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override"); //to add put,patch and delete requests
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const User = require("./models/user");

const ExpressError = require("./utilities/ExpressError");

//Routes requires
const courtRoutes = require("./routes/courts");
const reviewsRoutes = require("./routes/reviews");
const authRoutes = require("./routes/auth");

const app = express();

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); //serve static files
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

mongoose
  .connect("mongodb://localhost:27017/streetCourtsDB", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to Mongo server");
  })
  .catch((err) => {
    console.log("Mongo Connection error");
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/courts", courtRoutes);
app.use("/courts/:id/review", reviewsRoutes);
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found.", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong.";
  }
  res.status(status).render("error", { err });
});

app.listen("3000", () => {
  console.log("streetCourts server started on port 3000");
});
