const express = require('express');
const routes = express.Router();
const { uploadImgPath } = require('../model/user');
const { login , logout , registerFaculty , leaveStatus , leaveApproval , leaveReject , profile, editFaculty} = require('../controller/hod');
const verifyToken = require('../config/middleware');

routes.post('/login',login);

routes.use(verifyToken(["hod"]));
routes.post('/registerFaculty',uploadImgPath,registerFaculty);
routes.post('/editFaculty/:id',uploadImgPath,editFaculty);
routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveApproval/:id", leaveApproval);
routes.get("/leaveReject/:id", leaveReject);
routes.get("/logout", logout);
routes.get("/profile", profile);


module.exports = routes;