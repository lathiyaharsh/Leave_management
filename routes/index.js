const express = require("express");
const routes = express.Router();

routes.use("/user", require("./student"));
routes.use("/manage", require("./common"));

module.exports = routes;
