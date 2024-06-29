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

routes.get("/",verifyToken(["student","admin", "faculty"]), profile);
routes.get("/userList",verifyToken(["admin", "faculty","student"]), userList);
routes.get("/studentList",verifyToken(["admin", "faculty",]), studentList);
routes.get("/facultyList",verifyToken(["admin",]), facultyList);

routes.post("/", uploadImgPath, register);
routes.post("/addUser", uploadImgPath,verifyToken(["admin","faculty"]), register);

routes.put("/:id", uploadImgPath,verifyToken(["admin","faculty"]), editUser);
routes.put("/", uploadImgPath,verifyToken(["admin", "faculty", "student"]), editProfile);

routes.delete("/:id",verifyToken(["admin"]), removeUser);

module.exports = routes;