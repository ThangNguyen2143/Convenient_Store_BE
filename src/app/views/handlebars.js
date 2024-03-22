const handlebars = require('express-handlebars')
const moment = require('moment')
moment.locale('vi')

function setViewHbs(app){
    app.engine('hbs', 
        handlebars.engine({ 
        extname: '.hbs',
        helpers: {
            sum: (a, b) => a + b,
            sortRender: (field, sort) =>{
            var sortType = (sort.column === field) ? sort.type : 'default';
            var icons = {
                default: 'oi oi-elevator',
                asc: 'oi oi-sort-ascending',
                desc: 'oi oi-sort-descending'
            }
            var types = {
                default: 'desc',
                asc: 'desc',
                desc: 'asc'
            }
            var icon = icons[sortType]
            var type = types[sortType]

            return  `<a href="?_sort&column=${field}&type=${type}">
                <span class="${icon}"></span>
                </a>`
            },
            dateFormat: (data) =>{
            return moment(data).format('LLL');
            },
            convertMoney: (num) =>{
            if(!isNaN(parseInt(num)))
                return num.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
            else return num
            },
            stored: (data) =>{
            console.log(data);
            localStorage.setItem('data', JSON.stringify(data))
            }
        },
        
        })
    )
    app.set('view engine', 'hbs')
    
}

module.exports = setViewHbs
