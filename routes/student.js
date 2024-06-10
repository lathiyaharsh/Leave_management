const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const verifyToken = require("../middleware/middleware");
const {
  register,
  profile,
  editUser,
  applyLeave,
  leaveStatus,
  leaveBalance,
  forgetPassword,
  verifyOtp,
  resetPassword,
} = require("../controller/student");


routes.post("/register", uploadImgPath, register);


// routes.use(verifyToken(["student"]));

// routes.get("/profile",verifyToken(["student"]), profile);
routes.get("/leaveStatus",verifyToken(["student"]), leaveStatus);
routes.get("/leaveBalance",verifyToken(["student"]), leaveBalance);

routes.post("/applyLeave",verifyToken(["student"]), applyLeave);
// routes.put("/editUser", uploadImgPath,verifyToken(["student"]), editUser);

module.exports = routes;
