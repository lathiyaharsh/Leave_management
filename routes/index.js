const express = require("express");
const routes = express.Router();
const passport = require("passport");


routes.use("/auth", require("./auth"));
routes.use("/user", require("./user"));
routes.use("/leave", require("./leave"));


module.exports = routes;
