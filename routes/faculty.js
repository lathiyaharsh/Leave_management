const express = require("express");
const routes = express.Router();
const { login, logout, profile } = require("../controller/faculty");
const verifyToken = require("../config/middleware");

routes.post("/login", login);

routes.use(verifyToken(["faculty"]));
routes.get("/logout", logout);
routes.get("/profile", profile);

module.exports = routes;
