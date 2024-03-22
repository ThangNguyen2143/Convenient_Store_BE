const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

mongoose.plugin(slug)

const Schema = mongoose.Schema;

const Loai = new Schema({
  name: {type: String , default: "Loai"},
  VAT: {type: Number , default: "10"},
  slug: {type: String , slug: 'name',unique: true },
});

module.exports = mongoose.model('Loai', Loai)
