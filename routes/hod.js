const express = require('express');
const routes = express.Router();
const { uploadImgPath } = require('../model/user');
const { login , registerFaculty , leaveStatus , leaveApproval} = require('../controller/hod');
const verifyToken = require('../config/middleware');

routes.post('/login',login);

routes.post('/registerFaculty',uploadImgPath,verifyToken('hod'),registerFaculty);
routes.use(verifyToken('hod'));
routes.get("/leaveStatus", leaveStatus);
routes.get("/leaveApproval/:id", leaveApproval);


module.exports = routes;