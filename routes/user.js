const express = require('express');
const routes = express.Router();
const { register , login , profile} = require('../controller/user')
const { uploadImgPath } = require('../model/user')
const jwtAuth = require('../config/middleware')

routes.post('/register',uploadImgPath,register);
routes.post('/login',uploadImgPath,login); 

routes.get('/profile',jwtAuth,profile); 


module.exports = routes;