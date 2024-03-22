const SanPham = require('../models/SanPham')
const HoaDon = require('../models/HoaDon')
const Loai = require('../models/Loai')
const ChiTietHoaDon = require('../models/ChiTietHoaDon')
const moment = require('moment')
// const KhachHang = require('../models/KhachHang')
const { mutipleMongooseToObject } = require('../../util/mongoose')
const exportPDF = require('../../config/exportPDF/exportPDF')

class MeController{

    // [GET] /me/profile
    profileHandler(req, res, next){
        
    }
    //[POST] /me/cash
    cashsHandler(req, res, next){
        // var infCustomer = new KhachHang(req.body)
        // infCustomer.save()

        // console.log(infCustomer)
        res.json(req.body)
    }
    // [GET] /me/orders
    ordersHandler(req, res, next){
        ChiTietHoaDon.find({})
        .then(details =>{
           res.render('me/orders', {
                sanPham: mutipleMongooseToObject(details)
           })
        })
    }
    //[POST] /me/orders
    orders(req, res, next) {
        ChiTietHoaDon.findOne({idSp: req.body.idSp})
        .then((item)=>{
            if(item === null){
                const chiTietHoaDon = new ChiTietHoaDon(req.body)
                chiTietHoaDon.save()
                    .then(() => res.redirect('back'))
                    .catch((err)=>{
                        res.send(err)
                    })
            }
            else{
                var number = item.mount + Number.parseInt(req.body.mount)
                ChiTietHoaDon.updateOne({_id: item._id},{mount: number})
                    .then(()=>{
                        res.redirect('back')})
                    
                    .catch(next)
            }
        })
        .catch(next)  
    }
     // [GET] /me/stored/products
    storedProductsHandler(req, res, next){
        var queryName =""
        if(req.query.q) queryName = req.query.q
        let spQuery =SanPham.find({name: { $regex: queryName }})
        if(req.query.hasOwnProperty('_sort')){     
            spQuery = spQuery.sort({
                [req.query.column]: req.query.type
            })
        }
        Promise.all([spQuery,SanPham.countDeleted()])
            .then(([sanpham, deletedCount])=>{ 
                res.render('me/stored/products', {
                    deletedCount,
                    sanpham: mutipleMongooseToObject(sanpham)
                })
            })
            .catch(next)
    }
    // [GET] /me/stored/orders
    storedOrdersHandler(req, res, next){
        if(req.query.hasOwnProperty('exportPDF')){
            HoaDon.findById(req.query.idOrder)
                .then((order)=>{
                    var items =[]
                    order.detailOrder.forEach(sanPham => {
                        items.push(SanPham.findById(sanPham.idSp, 'name price'))
                    });
                    return [items, order]

                })
                .then((items)=>{
                    Promise.all(items[0])
                    .then((sanpham)=>{
                        var temp = []
                        for(var i=0; i<sanpham.length; i++){
                            var item ={
                                name:sanpham[i].name,
                                price:sanpham[i].price,
                                quantity:items[1].detailOrder[i].mount,
                                total: (sanpham[i].price *Number.parseInt(items[1].detailOrder[i].mount))
                            }
                            temp.push(item)
                        }
                        var invoice ={
                            No: items[1].No,
                            name: items[1].name,
                            address: items[1].address,
                            detailOrder: temp,
                            ThanhTien: items[1].ThanhTien,
                            createdAt: items[1].createdAt,
                        }
                        exportPDF(invoice)
                        res.redirect('/invoices_pdf/' + invoice.No +'.pdf')
                    })
                    .catch(next)
                })
                .catch(next)
        }
        else{
            HoaDon.find({name: { $regex: req.query.q ? req.query.q : ""}})
            .then(orders =>{
                res.render('me/stored/orders',{
                    orders: mutipleMongooseToObject(orders)
                })
            })
            .catch(next)
        }
        
    }
    // [GET] /me/stored/customers
    storedCustomersHandler(req, res, next){

    }
    // [GET] /me/trash-can
    trash_Can(req, res, next){
        SanPham.findDeleted({})
        .then( sanPham =>
            res.render('me/trash-can', {
                sanPham: mutipleMongooseToObject(sanPham)
            })
        )
        .catch(next)
    }
    // [GET] /me/signup
    signUpHandler(req, res, next){
        res.render('me/sign-up-form')
    }
    // [POST] /me/signup
    signUpPostHandler(req, res, next){
        res.json(req.body)
    }
    // [GET] /me/signin
    signInHandler(req, res, next){
        res.render('me/sign-in-form')
    }
    // [POST] /me/signin
    signInPostHandler(req, res, next){
        res.json(req.body)
    }
    // [GET] /me/signout
    signOutHandler(req, res, next){
        req.logout()
        res.redirect('/')
    }
    // [GET] /me/create/order
    createOrderHandler(req, res, next){
        SanPham.find({})
        .then( sanPham => {
            res.render('me/create-order', {
                sanPham: mutipleMongooseToObject(sanPham)
            })
        })
    }
    //[POST] /me/orderByAdmin
    orderByAdminHandler(req, res, next){
        var dataForm = req.body
        var detailOrder = []
        
        for(var i = 0; i < dataForm.mount.length; i++){
            var idSp = dataForm.idItem[i]
            var mount = dataForm.mount[i]
            var temp = {
                idSp: idSp,
                mount:mount
            }
            detailOrder.push(temp)
            SanPham.findById(idSp)
            .then( detail=>{
                var inventory = detail.stored - mount
                SanPham.updateOne({_id:idSp},{stored: inventory})
                .then(()=>{
                    console.log("Cập nhật sản phẩm thành công")
                })
                .catch(next)
            })
            .catch(next)
        }
        var orderByAdmin ={
            name: dataForm.customer,
            address: dataForm.address,
            phone: dataForm.phone,
            email: dataForm.email,
            ThanhTien: dataForm.ThanhTien,
            detailOrder: detailOrder
        }
        var hoadon = new HoaDon(orderByAdmin)
        hoadon.save()
        .then(()=>{
            res.render('me/createSuccess')
        })
        .catch(next)
        
    }
    // [GET] /me/report
    reportHandler(req, res, next){
        var Sanpham = [
            {
                name:"y te",
                percent:0,
            }
        ]
        var component =[]
        var typeShow =[
            {
                name:"report",
                items:Sanpham,
            }
        ]
        var data={
            months: [],
            title: "Báo cáo thống kê",
            components: component,
            types:typeShow
        }
        Promise.all([Loai.find(), HoaDon.find({ "$expr": { "$lte": [{ "$month": "$createdAt" }, 8] }})])
        .then(([type, orders]) => {
            var items =[]
            var months =[]
            var total = 0
            orders.forEach(order => {
                var month = moment(order.createdAt).format("M")
                if (months.length == 0) {
                    months.push(month)
                }
                
                order.detailOrder.forEach(item => {
                    items.push({
                        idSp:item.idSp,
                        mount: Number.parseInt(item.mount)
                    }
                        )
                    total += Number.parseInt(item.mount)
                })
            })
            
            var generalItem = []
            items.forEach(item => {
                
                if(generalItem.length === 0) {
                    generalItem.push({
                        idSp:item.idSp,
                        mount: Number.parseInt(item.mount)
                    })
                }
                else{
                    for (var i = 0; i < generalItem.length; i++) {
                        if(generalItem[i].idSp == item.idSp) {
                            generalItem[i].mount += Number.parseInt(item.mount)
                            break
                        }
                        if(i==generalItem.length -1){
                            generalItem.push({
                                idSp:item.idSp,
                                mount: Number.parseInt(item.mount)
                            })
                            
                            break
                            
                        }
                    }

                }
            })
            var types = []
            generalItem.forEach((item)=>{
                types.push( SanPham.findById(item.idSp, 'typeId'))
            })
            return [months,types, generalItem,type]
        })
        .then(([months,types, generalItem,type])=>{
            data.months.push({
                month: Number.parseInt(months[0]),
                name: 'Tháng '+ months[0],
            })
            data.title = "Báo cáo thống kê "+ data.months[0].name
            Promise.all(types)
            .then((idTypes)=> {
                var mountType =[];
                for(var j=0; j<idTypes.length; j++){
                    if(mountType.length == 0) {
                        mountType.push({
                            idType:idTypes[j].typeId,
                            mount: Number.parseInt(generalItem[j].mount)
                        })
                    }
                    else{
                        for (var i = 0; i < mountType.length; i++) {
                            if(mountType[i].idType == idTypes[j].typeId) {
                                mountType[i].mount += Number.parseInt(generalItem[j].mount)
                                break
                            }
                            else if(i==mountType.length -1){
                                mountType.push({
                                    idType:idTypes[j].typeId,
                                    mount: Number.parseInt(generalItem[j].mount)
                                })
                                break
                            }
                        }
                    }
                }
                var total = 0
                mountType.forEach(m =>{
                    total += Number.parseInt(m.mount)
                })
                // var ordersome ={}
                // generalItem.forEach(detail=>{
                //     sanpham.forEach(sp=>{
                //         if(sp._id == detail.idSp){
                //             mountType.forEach(types=>{
                //                 if(types.idType == sp.typeId){
                //                     console.log(Object.assign(ordersome, 
                //                         {   name: sp.name,
                //                             percent: Number.parseFloat((detail.mount/types.mount * 100).toFixed(2))
                //                         }))
                //                 }
                //             })
                            
                //         }
                //     })
                // })
                for (var i = 0; i < type.length; i++){
                    for (var j = 0; j < mountType.length; j++)
                        if(type[i]._id == mountType[j].idType){
                            component.push({
                                name: type[i].name,
                                percent: Number.parseFloat(((Number.parseFloat(mountType[j].mount)/total) * 100).toFixed(2))
                            })
                        }

                }
                res.render('me/reports/statistic',data)
            })
        })
        .catch(next)
        
    }
}

module.exports = new MeController
