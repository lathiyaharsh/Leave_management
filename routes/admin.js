const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const { login, registerHod, registerFaculty , logout, editHod, editFaculty } = require("../controller/admin");
const verifyToken = require("../config/middleware");

routes.post("/login", login);

routes.use(verifyToken(["admin"]))
routes.post("/registerHod", uploadImgPath, registerHod);
routes.put("/editHod/:id", uploadImgPath, editHod);
routes.put("/editFaculty/:id", uploadImgPath, editFaculty);
routes.post("/registerFaculty",uploadImgPath,registerFaculty);
routes.get('/logout',logout);
module.exports = routes;
