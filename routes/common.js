const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const {
  login,
  logout,
  studentList,
  hodList,
  facultyList,
  editStudent,
  leaveStatus,
  leaveApproval,
  leaveReject,
  profile,
  allLeaveStatus,
  editUser,
  applyLeave,
  userLeaveStatus,
  leaveBalance,
} = require("../controller/common");
const verifyToken = require("../middleware/middleware");
const { route } = require("./student");

routes.post("/login", login);
routes.post("/logout", logout);

routes.use(verifyToken(["admin", "hod", "faculty"]));

routes.get("/studentList", studentList);
routes.get("/hodList", hodList);
routes.get("/facultyList", facultyList);
routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveApproval/:id", leaveApproval);
routes.get("/leaveReject/:id", leaveReject);
routes.get("/profile", profile);
routes.get("/allLeaveStatus", allLeaveStatus);
routes.post("/applyLeave", applyLeave);
routes.get("/userLeaveStatus", userLeaveStatus);
routes.get("/leaveBalance", leaveBalance);

routes.put("/editStudent/:id", uploadImgPath, editStudent);
routes.put("/editUser", uploadImgPath, editUser);

module.exports = routes;
