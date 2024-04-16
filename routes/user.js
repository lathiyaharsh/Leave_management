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
} = require("../controller/user");
const { uploadImgPath } = require("../model/user");
const jwtAuth = require("../config/middleware");
const verifyToken = require("../config/middleware");

routes.post("/login", login);
routes.post("/register", uploadImgPath, register);

routes.put("/editUser", uploadImgPath, jwtAuth, editUser);

routes.use(verifyToken("student"));
routes.get("/profile", profile);
routes.get("/logout", logout);
routes.post("/applyLeave", applyLeave);
routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveBalance", leaveBalance);

module.exports = routes;
