const SanPham = require('../models/SanPham')
const Loai = require('../models/Loai')
// const writeFileAtomic = require('write-file-atomic')
const { mutipleMongooseToObject, mongooseToObject} = require('../../util/mongoose')

class ChiTietController{
    

    // [GET] /detail/:slug
    show(req, res, next){

        // Lấy dữ liệu từ request
        var slugvalue = req.params.slug
        SanPham.findOne({slug: slugvalue})
        .then(sanpham => {
            res.render('chiTiet/show', { 
                sanpham: mongooseToObject(sanpham),
            })},
        ) 
        .catch(next) 
    }
    
    // [GET] /detail/create
    create(req, res, next){

        Loai.find({})
            .then(type => {
                res.render('chiTiet/taoMoiForm', { type: mutipleMongooseToObject(type) })
            })
            .catch(next)
    }
    // [POST] /detail/addType
    addTypeHandler(req, res, next){
        const loai = new Loai(req.body)
        loai.save()
          .then(() => res.redirect('/detail/create'))
          .catch(next)
    }
    // [POST] /detail/stored
    stored(req, res, next){
        var dataForm = req.body
        const img = req.file
        Object.assign(dataForm,{
            image: '/img/items/'+img.filename
        }) 
        const sanpham = new SanPham(dataForm)
        // res.json(dataForm)
        sanpham.save()
            .then(() => 
                //Chuyển hướng trang tham khảo tại express API
                res.redirect('/me/stored/products'))
            .catch(next)
    }
    // [GET] /detail/:id/edit
    edit(req, res, next){
        SanPham.findById(req.params.id)
            .then(product => {
                var typeId = product.typeId
                Loai.find({})
                    .then(types => {
                        res.render('chiTiet/update', { 
                            product: mongooseToObject(product),
                            type: mutipleMongooseToObject(types)
                        })
                    })
                    .catch(next)
            })
            .catch(next)

    }

    // [PUT] /detail/:id
    update(req, res, next){
        SanPham.updateOne( {_id: req.params.id}, (req.body))
            .then( ()=>{
                res.redirect('/me/store/products')
            })
            .catch(next)
    
    }

    //[DELETE] /detail/:id
    delete(req, res, next){
        SanPham.delete({_id: req.params.id})
            .then( () => res.redirect('back'))
            .catch(next)
    }
    //[DELETE] /detail/:id/force
    destroy(req, res, next){
        SanPham.deleteOne({_id: req.params.id})
            .then( () => res.redirect('back'))
            .catch(next)
    }
    //[PATCH] /detail/:id/restore
    restore(req, res, next){
        SanPham.restore({_id: req.params.id})
            .then( () => res.redirect('back'))
            .catch(next)
    }
    //[POST] /detail/handle-controller
    handleController(req, res, next){
        switch (req.body.optionAction) {
            case 'deleteMultiItems':
                SanPham.delete({_id: {$in: req.body.productIds}})
                .then( () => res.redirect('back'))
                .catch(next)
                break
            case 'restoreMultiItems':
                SanPham.restore({_id: {$in: req.body.productIds}})
                .then( () => res.redirect('back'))
                .catch(next)
                break
            default:
                res.json(req.body)
                break;
        }
    }
}

module.exports = new ChiTietController
