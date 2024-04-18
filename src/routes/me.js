const express = require('express')
const router = express.Router()

const MeController = require('../app/controllers/MeController')

router.get('/profile', MeController.profileHandler)
router.get('/signup', MeController.signUpHandler)
router.get('/signin', MeController.signInHandler)
router.get('/signout', MeController.signOutHandler)
router.get('/orders', MeController.ordersHandler)
router.get('/stored/products', MeController.storedProductsHandler)
router.get('/trash/products', MeController.trash_Can) 
router.get('/stored/orders', MeController.storedOrdersHandler)
router.get('/stored/customer', MeController.storedCustomersHandler)
router.get('/create/order', MeController.createOrderHandler)
router.get('/report', MeController.reportHandler)

router.post('/orders', MeController.orders)
router.post('/signin', MeController.signInPostHandler)
router.post('/cash', MeController.cashsHandler)
router.post('/signup', MeController.signUpPostHandler)
router.post('/orderByAdmin', MeController.orderByAdminHandler)


module.exports = router
