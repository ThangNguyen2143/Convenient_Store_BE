const moment = require('moment')
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const dotenv = require("dotenv");

const SanPham = require('../models/SanPham')
const HoaDon = require('../models/HoaDon')
const Loai = require('../models/Loai')
const ChiTietHoaDon = require('../models/ChiTietHoaDon')
const Users = require('../models/Users')
const KhachHang = require('../models/KhachHang') 
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose')
const exportPDF = require('../../config/exportPDF/exportPDF')

dotenv.config()
class MeController{

    // [GET] /me/profile
    profileHandler(req, res, next){
        var content = "basicinf"
        if(req.query.page) content = (req.query.page)
        var login = (req.UserId) ? true: false;
        Users.findById(req.UserId)
        .then(user =>{
           return user.email   
        })
        .then(email =>{
            KhachHang.findOne({ email})
            .then(customer =>{
                
                res.render('me/profile', {
                    title: 'Trang cá nhân',
                    content,
                    customIn4: mongooseToObject(customer),
                    headType:{
                        isLogin: login,
                    }
                })
            })
        })
        
    }
    //[POST] /me/cash
    async cashsHandler(req, res, next){
        var dataForm = req.body
        var detailOrder = await ChiTietHoaDon.find()
        
        for(var i = 0; i < detailOrder.length; i++){
            var idSp = detailOrder[i].idSp
            var mount = detailOrder[i].mount
            SanPham.findById(idSp)
            .then( detail=>{
                var inventory = detail.stored - mount
                Promise.all([SanPham.updateOne({_id:idSp},{stored: inventory}),ChiTietHoaDon.findOneAndDelete({idSp})])
                .then(()=>{
                    console.log("Cập nhật sản phẩm thành công")
                })
                .catch(next)
            })
            .catch(next)
        }
        var orderByUser ={
            name: dataForm.name,
            address: dataForm.address,
            phone: dataForm.phone,
            email: dataForm.email,
            ThanhTien: dataForm.ThanhTien,
            detailOrder
        }
        var hoadon = new HoaDon(orderByUser)
        hoadon.save()
        .then(()=>{
            res.render('me/createSuccess',{
                title: "Thành công",
                headType:{
                    isLogin: true,
                },
                message: "Bạn đã đặt hàng thành công",
                pathHistory: "/"})
        })
        .catch(next)
     
    }
    // [GET] /me/orders
    async ordersHandler(req, res, next){
        if(req.query.name){
            ChiTietHoaDon.findOneAndDelete({name: req.query.name})
            .then((item)=>{
                console.log(item)
            })
            .catch(err =>{
                res.json(err)
            })
        }
        var isLogin = req.UserId ? true : false;
        var user =await Users.findById(req.UserId)
        Promise.all([ChiTietHoaDon.find({}), Loai.find({}), KhachHang.findOne({email: user.email})])
        .then(([details, type, customer]) =>{
           res.render('me/orders', {
                title: 'Giỏ hàng của bạn',
                sanPham: mutipleMongooseToObject(details),
                customerInfo: mongooseToObject(customer),
                headType:{
                    isLogin,
                    productTypes: mutipleMongooseToObject(type),
                }
                
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
        res.render('me/sign-up-form',{title: "Đăng kí"})
    }
    // [POST] /me/signup
    async signUpPostHandler(req, res, next){
        const {name, phone, email, address, passwd, confirmPassword} = req.body
        const userfind = await Users.findOne({email});
        if(userfind) {
            res.status(400).json({message: "Account has already exists."})
        }
        if (!passwd == confirmPassword)
            return res.status(400).json({ message: "Password don't match" });
        const hash = bcrypt.hashSync(passwd, 10);
        await Users.create({
                email: email,
                paswd: hash,
            });
        await KhachHang.create({
            name,
            phone,
            address,
            email
        })
        res.render('me/createSuccess',{
            title: "Thành công",
            message: "Bạn đã tạo tài khoản thành công",
            pathHistory: "/me/signin"}
        )
    }
    
    // [GET] /me/signin
    signInHandler(req, res, next){
        res.render('me/sign-in-form',{title: "Đăng nhập"})
    }
    // [POST] /me/signin
    async signInPostHandler(req, res, next){
        const { email, paswd } = req.body;

        const user = await Users.findOne({ email });

        if (!user) res.status(302).json({ error: "User Doesn't Exist" });

        bcrypt.compare(paswd, user.paswd) 
        .then(async (match) => {
            if (!match) 
                res.status(400).json({ error: "Wrong Username And Password Combination" });
            const accessToken = sign(
                { email: user.email, id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "3d" }
            );
            // Xử lý riêng theo từng trường hợp server
            // res.json({ token: accessToken, username: username, id: user.id });
            res.cookie('header',accessToken).redirect("/")
        })
        .catch(err =>res.json({message: err}))
    }
    // [GET] /me/signout
    signOutHandler(req, res, next){
        res.clearCookie('header').redirect('back')
    }
    
    // [PUT] /user/update/:id - only update customer
    async updateProfile(req, res) {
        const { name, year, cccd, phone} = req.body
        const { id_user} = req.params
        await Customer.update(
            {
                custom_name: name,
                year_of_birth: year,
                id_card: cccd,
                phone_number: phone,
            },
            {where: {UserId: id_user}}
        )
        res.status(200).json('success')
    }
    // [PUT] /user/changepassword/:id
    async changePassword(req, res) {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findOne({ where: { user_name: req.user.username } });

        bcrypt.compare(oldPassword, user.password).then(async (match) => {
            if (!match) res.json({ error: "Wrong Password Entered!" });

            bcrypt.hash(newPassword, 10).then((hash) => {
            User.update(
                { password: hash },
                { where: { user_name: req.user.user_name } }
            );
            res.status(200).json("SUCCESS");
            });

    });
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
            res.render('me/createSuccess',{
                title: "Thành công",
                message: "Bạn đã tạo đơn hàng thành công",
                pathHistory: "/me/create/order"})
        })
        .catch(next)
        
    }
    // [GET] /me/report
    reportHandler(req, res, next){

        var data={
            months: [],
            title: "Báo cáo thống kê",
            components: [],
            types:[],
            headType:{
                isLogin: (req.UserId != undefined ? true:false),
            }
        }
        Promise.all([Loai.find(), HoaDon.find({ "$expr": { "$lte": [{ "$month": "$createdAt" }, 8] }})])
        .then(([type, orders]) => {
            var items =[]
            var months =[]
            var total = 0
            orders.forEach(order => {
                var month = moment(order.createdAt).format("M")
                if (months.length == 0) months.push(month)
                
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
                for (var i = 0; i < type.length; i++){
                    for (var j = 0; j < mountType.length; j++)
                        if(type[i]._id == mountType[j].idType){
                            data.components.push({
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
