const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

mongoose.plugin(slug)

const Schema = mongoose.Schema;

const HoaDon = new Schema({
    No:{type: String,slug:['name','phone'],slugPaddingSize: 5, unique: true},
    name: {type: String , default: "Passersby"},
    address: {type: String , default: "NoneAddress"},
    phone: {type: String, default: "NonePhone"},
    email: {type: String, default: "NoneEmail"},
    ThanhTien: Number,
    detailOrder: {type: Array, default:[]}
},{
    timestamps: true
});
HoaDon.index( { No: "Null-00" }, function(err, result) {
    callback(result);
})

module.exports = mongoose.model('HoaDon', HoaDon)