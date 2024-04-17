const path = require('path')
const express = require('express')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const http = require('http')

const SortMiddleware = require('./app/middlewares/SortMiddleware')
const route = require('./routes')
const database = require('./config/database')
const setViewHbs = require('./app/views/handlebars')
const Auth = require('./app/middlewares/Auth')

database.connect()



const app = express()
const port = process.env.PORT

//Khai báo middleware
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.json())
app.use(methodOverride('_method'))
app.use(SortMiddleware)
app.use(Auth)

//handlebars middleware
// View handlebars
setViewHbs(app)
app.set('views', path.join(__dirname, 'resources', 'views'))
route(app)

app.set('port', port)
http.createServer(app).listen(port)


