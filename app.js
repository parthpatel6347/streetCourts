// jshint esversion:9

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo"); //for storing session on mongo
const flash = require("connect-flash"); //flash message middleware
const methodOverride = require("method-override"); //to add put,patch and delete requests
const ejsMate = require("ejs-mate");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const mongoSanitize = require("express-mongo-sanitize"); // security - prevents MongoDB operator injection
const helmet = require("helmet"); //security by setting various http headers

const User = require("./models/user");

const ExpressError = require("./utilities/ExpressError");

//Routes requires
const courtRoutes = require("./routes/courts");
const reviewsRoutes = require("./routes/reviews");
const authRoutes = require("./routes/auth");

//connection to mongo database

const dbUrl =
  process.env.DATABASE_URL || "mongodb://localhost:27017/streetCourtsDB";
mongoose
  .connect(dbUrl, {
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

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); //serve static files
app.use(methodOverride("_method")); //to add put, patch and delete requests. (Check form in ejs files)
app.use(mongoSanitize({ replaceWith: "_" }));

//for storing session on Mongo

const secret = process.env.SESSION_SECRET || "reallybadsecret";

const storeSession = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

//managing error for mongo session store
storeSession.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

app.use(
  session({
    store: storeSession, //session store on mongo
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      //secure:true,           //only allows cookies on https (for production only, will not work in development since localhost is not https)
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //one week (milliseconds to week)
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

//to make user data, flash data(success or error) to be always available in ejs files
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(helmet({ contentSecurityPolicy: false })); //contentsecuritypolicy restricts content from other websites such as unsplash.com. It needs to be given options to allow content from specific websites. Turned off for our purposes

//App routes
app.use("/courts", courtRoutes);
app.use("/courts/:id/review", reviewsRoutes);
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

//For any URL other than above, gives 404 error
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found.", 404));
});

//error handling
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong.";
  }
  res.status(status).render("error", { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`streetCourts server started on port ${port}`);
});
