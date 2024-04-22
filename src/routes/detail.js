const express = require('express')
const upload = require('../config/setStoredUpload/setStorageImage')

const router = express.Router()
const HandlerErr = require('../app/middlewares/HandlerErr')
const DetailController = require('../app/controllers/ChitietController')

router.get('/create',DetailController.create, HandlerErr)
router.post('/stored',upload.single('image'), DetailController.stored, HandlerErr)
router.post('/addType',DetailController.addTypeHandler, HandlerErr)
router.get('/:slug',DetailController.show, HandlerErr)
router.get('/:id/edit', DetailController.edit, HandlerErr)
// router.patch('/:id/restore', DetailController.restore)
// router.put('/:id', DetailController.update)
// router.delete('/:id/force', DetailController.destroy)
router.delete('/:id', DetailController.delete, HandlerErr)

module.exports = router
