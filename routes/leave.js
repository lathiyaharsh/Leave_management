const express = require("express");
const routes = express.Router();
const verifyToken = require("../middleware/middleware");
const {
  leaveStatus,
  leaveApproval,
  leaveReject,
  leaveReport,
  applyLeave,
  userLeaveStatus,
  leaveBalance,
  allLeaveStatus
} = require("../controller/leave");


routes.get("/leaveReport",verifyToken(["admin"]), leaveReport);
routes.get("/leaveStatus",verifyToken(["admin", "hod", "faculty"]), leaveStatus);//own leave status
routes.get("/allLeaveStatus",verifyToken(["admin", "hod", "faculty"]), allLeaveStatus);
routes.get("/leaveApproval/:id",verifyToken(["admin", "hod", "faculty"]), leaveApproval);
routes.get("/leaveReject/:id",verifyToken(["admin", "hod", "faculty"]), leaveReject);
routes.post("/applyLeave",verifyToken(["admin", "hod", "faculty","student"]), applyLeave);
routes.get("/userLeaveStatus",verifyToken(["admin", "hod", "faculty","student"]), userLeaveStatus);
routes.get("/leaveBalance",verifyToken(["admin", "hod", "faculty","student"]), leaveBalance);


module.exports = routes;