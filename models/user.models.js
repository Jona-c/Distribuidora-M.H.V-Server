const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre:        String,
    apellido:      String,
    razon_social:  String,
    email: {
        type:   String,
        unique: true,
    },
    telefono:      String,
    direccion:     String,
    localidad:     String,
    provincia:     String,
    cuit:          String,
    condicion_IVA: String,
    password:      String,
    active:        Boolean,
    role: {
        type:    String,
        enum:    ['admin', 'client'],
        default: 'client',
    },
    // ★ Campos para recuperación de contraseña
    resetCode:        { type: String,  default: null },  // código hasheado
    resetCodeExpires: { type: Date,    default: null },  // expira en 15 min
});

module.exports = mongoose.model('User', userSchema);