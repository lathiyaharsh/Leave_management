const express = require("express");
const routes = express.Router();
const verifyToken = require("../middleware/middleware");
const { uploadImgPath } = require("../model/user");
const {
  profile,
  userList,
  removeUser,
  register,
  editUser,
  editProfile,
  studentList,
  facultyList
} = require("../controller/user");

// routes.use(verifyToken(["student","admin", "faculty"]));

routes.get("/removeUser/:id",verifyToken(["admin"]), removeUser);
routes.get("/profile",verifyToken(["student","admin", "faculty"]), profile);
routes.get("/userList",verifyToken(["admin", "faculty","student"]), userList);
routes.get("/studentList",verifyToken(["admin", "faculty",]), studentList);
routes.get("/facultyList",verifyToken(["admin",]), facultyList);

routes.post("/register", uploadImgPath, register);
routes.post("/addUser", uploadImgPath,verifyToken(["admin","faculty"]), register);

routes.put("/editUser/:id", uploadImgPath,verifyToken(["admin","faculty"]), editUser);
routes.put("/editProfile", uploadImgPath,verifyToken(["admin", "faculty", "student"]), editProfile);

module.exports = routes;
