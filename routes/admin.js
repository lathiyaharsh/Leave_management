const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const { login, registerHod, registerFaculty , logout } = require("../controller/admin");
const verifyToken = require("../config/middleware");

routes.post("/login", login);

routes.post("/registerHod", uploadImgPath, verifyToken("admin"), registerHod);
routes.post(
  "/registerFaculty",
  uploadImgPath,
  verifyToken("admin"),
  registerFaculty
);
routes.use(verifyToken("admin"))
routes.get('/logout',logout);
module.exports = routes;
