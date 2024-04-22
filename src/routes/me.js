const express = require('express')
const router = express.Router()

const MeController = require('../app/controllers/MeController')
const HandlerErr = require('../app/middlewares/HandlerErr')
router.get('/profile', MeController.profileHandler, HandlerErr)
router.get('/signup', MeController.signUpHandler, HandlerErr)
router.get('/signin', MeController.signInHandler, HandlerErr)
router.get('/signout', MeController.signOutHandler, HandlerErr)
router.get('/orders', MeController.ordersHandler, HandlerErr)
router.get('/stored/products', MeController.storedProductsHandler, HandlerErr)
router.get('/trash/products', MeController.trash_Can, HandlerErr) 
router.get('/stored/orders', MeController.storedOrdersHandler, HandlerErr)
router.get('/stored/customer', MeController.storedCustomersHandler, HandlerErr)
router.get('/create/order', MeController.createOrderHandler, HandlerErr)
router.get('/report', MeController.reportHandler, HandlerErr)

router.post('/orders', MeController.orders, HandlerErr)
router.post('/signin', MeController.signInPostHandler, HandlerErr)
router.post('/cash', MeController.cashsHandler, HandlerErr)
router.post('/signup', MeController.signUpPostHandler, HandlerErr)
router.post('/orderByAdmin', MeController.orderByAdminHandler, HandlerErr)


module.exports = router
