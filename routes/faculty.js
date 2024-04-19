const express = require("express");
const routes = express.Router();
const verifyToken = require("../middleware/middleware");

routes.use(verifyToken(["faculty"]));

module.exports = routes;
