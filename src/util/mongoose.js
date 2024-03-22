module.exports = {
    // Chuyển nhiều ob mongoose sang ob thường
    mutipleMongooseToObject: function (mongooseArray){
        return mongooseArray.map(item => item.toObject())
    },
    mongooseToObject: function (mongooseObject){
        return mongooseObject ? mongooseObject.toObject() : mongooseObject
    }
}