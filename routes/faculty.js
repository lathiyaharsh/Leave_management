const express = require("express");
const routes = express.Router();
const { login, logout } = require("../controller/faculty");
const verifyToken = require("../config/middleware");

routes.post("/login", login);

routes.use(verifyToken(["faculty"]));
routes.get("/logout", logout);

module.exports = routes;
