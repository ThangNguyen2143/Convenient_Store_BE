const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const ChiTietHoaDon = new Schema({
    idSp: String,
    name: String,
    price: Number,
    image: String,
    mount: Number
});
module.exports = mongoose.model('ChiTietHoaDon', ChiTietHoaDon)