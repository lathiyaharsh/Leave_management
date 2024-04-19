const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const {
  registerFaculty,
  editFaculty,
} = require("../controller/hod");
const verifyToken = require("../middleware/middleware");


routes.use(verifyToken(["hod"]));
routes.post("/registerFaculty", uploadImgPath, registerFaculty);
routes.post("/editFaculty/:id", uploadImgPath, editFaculty);

module.exports = routes;
