const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// crear el token
function createAccessToken(user) {
    //fecha de vencimiento
    const expDate = new Date();
    expDate.setHours(expDate.getHours() + 3);

    //informacion detras del token
    const payload = {
        token_type: 'access',
        user_id: user._id,
        role: user.role,
        iat: Date.now(), 
        exp: expDate.getTime(), 
    };

    return jwt.sign(payload, JWT_SECRET_KEY);
}

// obtener y verificar la informacion detras del token
function decode(token) {
    // jwt.verify validará la firma y lanzará si no es válido
    return jwt.verify(token, JWT_SECRET_KEY,true);
}

module.exports = {
    createAccessToken,
    decode,
};