const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const verifyToken = require("../config/middleware");
const {
  login,
  registerHod,
  registerFaculty,
  logout,
  editHod,
  editFaculty,
  leaveStatus,
  leaveApproval,
  leaveReject,
  leaveReport,
  removeUser,
} = require("../controller/admin");


routes.post("/login", login);

routes.use(verifyToken(["admin"]));

routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveApproval/:id", leaveApproval);
routes.get("/leaveReject/:id", leaveReject);
routes.get("/leaveReport", leaveReport);
routes.get("/removeUser/:id", removeUser);
routes.get("/logout", logout);

routes.post("/registerHod", uploadImgPath, registerHod);
routes.post("/registerFaculty", uploadImgPath, registerFaculty);

routes.put("/editHod/:id", uploadImgPath, editHod);
routes.put("/editFaculty/:id", uploadImgPath, editFaculty);

module.exports = routes;
