const User = require('../models/user.models.js');
const bcrypt = require('bcryptjs');
const jwt = require('../utils/jwt.js');

// ......registrar usuarios
async function register(req,res) {
    //obtener datos}
    const {nombre, apellido, razon_social, email, telefono, direccion, localidad, provincia, cuit, condicion_IVA, password} = req.body;

    // validar datos
    if (!nombre) return res.status(400).send({ msg: "El nombre es obligatorio"}); 
    if (!apellido) return res.status(400).send({ msg: "El apellido es obligatorio"}); 
    if (!email) return res.status(400).send({ msg: "El email es obligatorio"}); 
    if (!telefono) return res.status(400).send({ msg: "El telefono es obligatorio"}); 
    if (!direccion) return res.status(400).send({ msg: "La direccion es obligatoria"}); 
    if (!localidad) return res.status(400).send({ msg: "La localidad es obligatoria"}); 
    if (!provincia) return res.status(400).send({ msg: "La provincia es obligatoria"}); 
    if (!cuit) return res.status(400).send({ msg: "El cuit es obligatorio"}); 
    if (!condicion_IVA) return res.status(400).send({ msg: "La condicion es obligatoria"});
    if (!password) return res.status(400).send({ msg: "La contraseña es obligatoria"});

    // crear usuario
    const user = new User({
        nombre : nombre,
        apellido : apellido,
        ...(razon_social && { razon_social }),
        email : email,
        telefono : telefono,
        direccion : direccion,
        localidad : localidad,
        provincia : provincia,
        cuit : cuit,
        condicion_IVA : condicion_IVA,
        password : password,
        active : false,
    })
    
    // hash contraseña
    user.password = bcrypt.hashSync(password, 10);

    //guardar el usuario en la db
    try {
        await user.save();
        res.status(201).send({ msg: 'Usuario guardado correctamente ✅' });
    }catch(err){
        res.status(500).send({ msg: `Error al crear el usuario ❌ ${err}` });
    }
}


// ......iniciar sesion

async function login(req,res) {
    //obtener los datos (usuario y contraseña)
    const { email, password } = req.body;

    console.log(email)
    console.log(password)

    // validar los datos
    if (!email) return res.status(400).send({ msg: "El email es obligatorio"});
    if (!password) return res.status(400).send({ msg: "La contraseña es obligatoria"});

    try {
        // validar si el usuario esta en la base de datos}
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).send({ msg: 'Usuario no encontrado'});

        // validar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).send({ msg: 'Contraseña incorrecta'});

        // validar si está activa
        if (!user.active) return res.status(401).send({ msg: 'Usuario no autorizado o no activo'});

        // iniciar sesion
        const token = jwt.createAccessToken(user);

        res.status(200).send({ 
            token: token,
            role: user.role
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error del servidor:'});
    }    
    

}

module.exports = {
    register,
    login,
}