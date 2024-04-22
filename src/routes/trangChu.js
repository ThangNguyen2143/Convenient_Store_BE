const express = require('express')
const router = express.Router()


const TrangChuController = require('../app/controllers/TrangChuController')
const HandlerErr = require('../app/middlewares/HandlerErr')
router.get('/:slug', TrangChuController.typePage, HandlerErr)
router.get('/', TrangChuController.index, HandlerErr) 

module.exports = router