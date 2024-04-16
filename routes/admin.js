const express = require('express');
const routes = express.Router();
const { uploadImgPath } = require('../model/user');
const { login , registerHod} = require('../controller/admin');
const verifyToken = require('../config/middleware');

routes.get('/login',login);

routes.post('/registerHod',uploadImgPath,verifyToken('admin'),registerHod);



module.exports = routes