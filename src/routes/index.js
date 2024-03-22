const trangChuRouter = require('./trangChu')
const meRouter = require('./me')
const detailRouter = require('./detail')

function route(app){
    app.use('/me',meRouter)
    app.use('/detail',detailRouter)
    app.use('/',trangChuRouter)
    
}

module.exports = route;
