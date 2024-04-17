const express = require('express')
const router = express.Router()


const TrangChuController = require('../app/controllers/TrangChuController')

router.get('/:slug', TrangChuController.typePage)
router.get('/', TrangChuController.index) 

module.exports = router