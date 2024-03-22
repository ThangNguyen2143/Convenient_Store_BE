const express = require('express')
const upload = require('../config/setStoredUpload/setStorageImage')

const router = express.Router()

const DetailController = require('../app/controllers/ChitietController')

router.get('/create',DetailController.create)
router.post('/stored',upload.single('image'), DetailController.stored)
router.post('/addType',DetailController.addTypeHandler)
router.get('/:slug',DetailController.show)
router.get('/:id/edit', DetailController.edit)
// router.patch('/:id/restore', DetailController.restore)
// router.put('/:id', DetailController.update)
// router.delete('/:id/force', DetailController.destroy)
router.delete('/:id', DetailController.delete)

module.exports = router
