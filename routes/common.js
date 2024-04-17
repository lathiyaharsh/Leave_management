const express = require("express");
const routes = express.Router();
const { uploadImgPath } = require("../model/user");
const { studentList , hodList , facultyList , editStudent} = require("../controller/common");
const verifyToken = require("../config/middleware");
const { route } = require("./student");

routes.use(verifyToken(["admin","hod","faculty"]));

routes.put('/editStudent/:id',uploadImgPath,editStudent)
routes.get('/studentList',studentList)
routes.get('/hodList',hodList)
routes.get('/facultyList',facultyList)

module.exports = routes;
