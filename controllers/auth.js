// jshint esversion:9

const User = require("../models/user");

//GET route for register form
module.exports.renderRegisterForm = (req, res) => {
  res.render("auth/register");
};

//POST route for registering user
module.exports.registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const newUser = new User({
      email,
      username,
    });
    const regUser = await User.register(newUser, password);
    req.login(regUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to streetCourts!");
      res.redirect("/courts");
    });
  } catch (e) {
    console.log(e);
    if (e.keyPattern) {
      req.flash("error", "A user with the given email is already registered.");
    } else {
      req.flash("error", e.message);
    }
    res.redirect("/register");
  }
};

//GET request for login form
module.exports.renderLoginForm = (req, res) => {
  res.render("auth/login");
};

//POST route for login form
module.exports.loginPostRoute = (req, res) => {
  req.flash("success", "Logged in successfully");
  const redirectUrl = req.session.returnToUrl || "/courts";
  delete req.session.returnToUrl;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Logged out successfully.");
  res.redirect("/login");
};
