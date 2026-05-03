const jwt = require('../utils/jwt.js');

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({ msg: 'la peticion no tiene cabecera' });
    }

    
    const token = req.headers.authorization;

    try {
        const payload = jwt.decode(token);

        const { exp } = payload; // hora que expira
        const currentData = new Date().getTime(); // hora actual

        if (exp <= currentData) {
            return res.status(401).send({ msg: 'el token ha expirado' });
        }

        req.user = payload;

        next();
    } catch (error) {
        return res.status(401).send({ msg: 'el token no es valido' });
    }
}

module.exports = {
    verifyToken,
};