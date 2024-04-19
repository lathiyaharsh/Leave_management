const express = require("express");
const routes = express.Router();
const {
  register,
  login,
  profile,
  editUser,
  logout,
  applyLeave,
  leaveStatus,
  leaveBalance,
  forgetPassword,
  verifyOtp,
  resetPassword,
} = require("../controller/user");
const { uploadImgPath } = require("../model/user");
const verifyToken = require("../middleware/middleware");

routes.post("/login", login);
routes.post("/register", uploadImgPath, register);
routes.post("/forgetPassword", forgetPassword);
routes.post("/verifyOtp", verifyOtp);

routes.put("/resetPassword", resetPassword);

routes.use(verifyToken(["student"]));
routes.put("/editUser", uploadImgPath, editUser);
routes.get("/profile", profile);
routes.get("/logout", logout);
routes.post("/applyLeave", applyLeave);
routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveBalance", leaveBalance);

module.exports = routes;
