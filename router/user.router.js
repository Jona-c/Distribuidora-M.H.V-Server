const express = require('express')
const { getMe } = require('../controllers/user.controller.js');
const md_auth = require('../middlewares/authenticated.js');

//crear rutas
const router = express.Router();

router.get('/user/me', [md_auth.verifyToken], getMe);


module.exports = router;