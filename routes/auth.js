require("dotenv").config();
const express = require("express");
const routes = express.Router();
const {
  login,
  logout,
  forgetPassword,
  verifyOtp,
  resetPassword,
  googleLogin
} = require("../controller/auth");
const passport = require("passport");
const verifyToken = require("../middleware/middleware");
const { roleByName } = require("../config/variables");

routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

routes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/login" }),
  googleLogin
);

routes.get("/logout", logout);

routes.post("/login", login);
routes.post("/forgetPassword", forgetPassword);
routes.post("/verifyOtp", verifyOtp);
routes.post(
  "/resetPassword",
  verifyToken(["admin", "faculty", "student"]),
  resetPassword
);

module.exports = routes;
