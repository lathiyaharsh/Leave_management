const express = require("express");
const routes = express.Router();
const passport = require("passport");

routes.use("/user", require("./student"));
routes.use("/manage", require("./common"));
routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

routes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/home");
  }
);

routes.get("/home", async (req, res) => {
  res.send("Home");
});

module.exports = routes;
