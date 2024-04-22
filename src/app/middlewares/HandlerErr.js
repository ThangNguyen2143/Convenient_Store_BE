module.exports = function erroHandler(req, res, next){
        res.render('errorPage',{
            title: "Opps, Lỗi rồi",
            headType:{
                isLogin: req.UserId ? true : false,
            }
        })
}