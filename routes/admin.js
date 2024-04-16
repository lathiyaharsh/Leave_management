const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const { login, registerHod, registerFaculty } = require("../controller/admin");
const verifyToken = require("../config/middleware");

routes.post("/login", login);

routes.post("/registerHod", uploadImgPath, verifyToken("admin"), registerHod);
routes.post(
  "/registerFaculty",
  uploadImgPath,
  verifyToken("admin"),
  registerFaculty
);

module.exports = routes;
