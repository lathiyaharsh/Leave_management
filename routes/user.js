const express = require("express");
const routes = express.Router();
const verifyToken = require("../middleware/middleware");
const {
  getRole
} = require("../controller/user");



routes.use(verifyToken(["student","admin", "hod", "faculty"]));

routes.get('/getRole',getRole)

module.exports = routes;
