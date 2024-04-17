const jwt = require('jsonwebtoken');
module.exports = function Auth(req, res, next) {
    const token = req.cookies.header
    if(token) {
        decodeData = jwt.verify(token, process.env.JWT_SECRET);
        req.UserId = decodeData?.id;
    }
    next();

    // try {
    //     const isCustomAuth = token.length < 500;

    //     let decodeData;
    //     if (token && isCustomAuth) {
    //     } else {
    //     decodeData = jwt.decode(token);
    //     req.UserId = decodeData?.sub;
    //     }
    // } catch (error) { res.json(error); }

}