const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const User = new Schema({
    email: {
        type: String,
        required: true,
    },
    paswd: {
        type: String,
        required: true,
        min: [6, 'Mật khẩu ít nhất 6 kí tự']
    }
});
module.exports = mongoose.model('User', User)