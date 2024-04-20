const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const verifyToken = require("../middleware/middleware");
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

routes.post("/login", login);
routes.post("/register", uploadImgPath, register);
routes.post("/forgetPassword", forgetPassword);
routes.post("/verifyOtp", verifyOtp);

routes.put("/resetPassword", resetPassword);

routes.use(verifyToken(["student"]));

routes.get("/profile", profile);
routes.get("/logout", logout);
routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveBalance", leaveBalance);

routes.post("/applyLeave", applyLeave);
routes.put("/editUser", uploadImgPath, editUser);

module.exports = routes;
