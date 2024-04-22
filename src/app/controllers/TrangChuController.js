const Loai = require('../models/Loai')
const SanPham = require('../models/SanPham')
const { mutipleMongooseToObject} = require('../../util/mongoose')

class TrangChuController{

    // [GET] home
    index(req, res, next){
        var login = false
        if(req.UserId) login = true
        Loai.find()
        .then(type =>{
            res.render('home',{
                title: 'Trang chủ',
                headType:{
                    isLogin: login,
                    productTypes: mutipleMongooseToObject(type)
                }
            })
        })
        .catch(err => next(err))
        
    }
    // [GET] /:typeProduct
    async typePage(req, res, next){
        Loai.find()
        .then(type =>{
            let typeFind = {_id: null}
            type.forEach(item => {if(item.slug === req.params.slug) return typeFind = item})
            SanPham.find({ typeId: typeFind['_id'] })
            .then(sanpham =>{
                res.render('typePage',{
                    title: typeFind.name,
                    headType:{
                        isLogin: (req.UserId != undefined ? true:false),
                        productTypes: mutipleMongooseToObject(type)
                    },
                    sanpham: mutipleMongooseToObject(sanpham)
                })
            })
            .catch(err => next(err))
        })
       
    }
}

module.exports = new TrangChuController
