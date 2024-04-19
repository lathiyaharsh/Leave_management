const express = require("express");
const routes = express.Router();
const { login, logout } = require("../controller/faculty");
const verifyToken = require("../middleware/middleware");


routes.use(verifyToken(["faculty"]));
routes.get("/logout", logout);

module.exports = routes;
