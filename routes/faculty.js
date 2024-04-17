const express = require('express');
const routes = express.Router();
const { login ,logout, leaveStatus , leaveApproval , leaveReject , profile} = require('../controller/faculty');
const verifyToken = require('../config/middleware');

routes.post('/login',login);

routes.use(verifyToken(["faculty"]));
routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveApproval/:id", leaveApproval);
routes.get("/leaveReject/:id", leaveReject);
routes.get("/logout", logout);
routes.get("/profile", profile);


module.exports = routes;