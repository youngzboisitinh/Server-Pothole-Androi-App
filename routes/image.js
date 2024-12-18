const express = require('express');
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const fs = require('fs');
const auth = require('../middleware/auth');


const router = express.Router();




module.exports = router;