const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const KhachHang = new Schema({
  name: {type: String , default: "Nguyen Thi A"},
  address: {type: String , default: "NoneAddress"},
  phone: {type: String, default: "NonePhone"},
  email: {type: String, default: "NoneEmail"},

},{
  timestamps: true,
});

module.exports = mongoose.model('KhachHang', KhachHang)
