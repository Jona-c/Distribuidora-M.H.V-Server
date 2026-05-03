const User = require('../models/user.models.js');

// obtener ususario
async function getMe(req, res) {
    try {
        const { user_id } = req.user;
        
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).send({ msg: 'No se ha encontrado el usuario' });
    }

        return res.status(200).send( user );
    }catch (error) {
        return res.status(500).send({ msg: 'Error interno del servidor' });
    }
}


module.exports = {
    getMe,
};