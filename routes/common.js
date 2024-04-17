const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const {
  studentList,
  hodList,
  facultyList,
  editStudent,
  leaveStatus,
  leaveApproval,
  leaveReject,
  profile,
} = require("../controller/common");
const verifyToken = require("../config/middleware");
const { route } = require("./student");

routes.use(verifyToken(["admin", "hod", "faculty"]));

routes.get("/studentList", studentList);
routes.get("/hodList", hodList);
routes.get("/facultyList", facultyList);
routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveApproval/:id", leaveApproval);
routes.get("/leaveReject/:id", leaveReject);
routes.get("/profile", profile);

routes.put("/editStudent/:id", uploadImgPath, editStudent);

module.exports = routes;
