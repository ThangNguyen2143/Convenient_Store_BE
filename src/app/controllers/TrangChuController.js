const Loai = require('../models/Loai')
const SanPham = require('../models/SanPham')
const { mutipleMongooseToObject} = require('../../util/mongoose')

class TrangChuController{

    // [GET] home
    index(req, res, next){
        res.render('home',{
            title: 'Trang chủ'
        }) 
        
    }
    typePage(req, res, next){
        Loai.findOne({slug: req.params.slug})
        .then(type => {
            SanPham.find({ typeId: type.id })
                .then(sanpham =>{
                    res.render('typePage',{
                        sanpham: mutipleMongooseToObject(sanpham)
                    })
                })
                .catch(next)
        })
        .catch(next)
    }
}

module.exports = new TrangChuController
