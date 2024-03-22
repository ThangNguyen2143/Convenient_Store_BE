const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')

mongoose.plugin(slug)

const Schema = mongoose.Schema;

const SanPham = new Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  stored: Number,
  typeId: String,
  slug: {type: String , slug: 'name',slugPaddingSize: 4,unique: true },

},{
  timestamps: true,
});

SanPham.plugin(mongooseDelete, { 
  overrideMethods: true,
  deletedAt: true })

module.exports = mongoose.model('SanPham', SanPham)
