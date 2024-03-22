const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()
async function connect(){
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connection to database successful')

    } catch (error) {
        console.log(error)
        console.log('connect failed')
    }
}

module.exports = { connect }