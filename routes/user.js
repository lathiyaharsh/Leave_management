const express = require("express");
const routes = express.Router();
const verifyToken = require("../middleware/middleware");
const { uploadImgPath } = require("../model/user");
const {
  getRole,
  profile,
  userList,
  removeUser,
  register,
  editUser,
  editProfile
} = require("../controller/user");

// routes.use(verifyToken(["student","admin", "hod", "faculty"]));

routes.get("/removeUser/:id",verifyToken(["admin"]), removeUser);
routes.get('/getRole',verifyToken(["student","admin", "hod", "faculty"]),getRole)
routes.get("/profile",verifyToken(["student","admin", "hod", "faculty"]), profile);
routes.get("/userList",verifyToken(["admin", "hod", "faculty"]), userList);

routes.post("/register", uploadImgPath, register);
routes.post("/registerHod", uploadImgPath,verifyToken(["admin","hod"]), register);
routes.post("/registerFaculty", uploadImgPath,verifyToken(["admin","hod"]), register);

routes.put("/editUser/:id", uploadImgPath,verifyToken(["admin","hod","faculty"]), editUser);
routes.put("/editProfile", uploadImgPath,verifyToken(["admin", "hod", "faculty", "student"]), editProfile);

module.exports = routes;
