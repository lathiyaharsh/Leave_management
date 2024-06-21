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
} = require("../controller/leave");

routes.get("/leaveReport",verifyToken(["admin"]), leaveReport);
routes.get("/leaveStatus",verifyToken(["admin", "faculty"]), leaveStatus);
routes.get("/leaveApproval/:id",verifyToken(["admin", "faculty"]), leaveApproval);
routes.get("/leaveReject/:id",verifyToken(["admin", "faculty"]), leaveReject);
routes.get("/userLeaveStatus",verifyToken(["admin", "faculty","student"]), userLeaveStatus);//own leave status
routes.get("/leaveBalance",verifyToken(["admin", "faculty","student"]), leaveBalance);

routes.post("/applyLeave",verifyToken(["student"]), applyLeave);

module.exports = routes;