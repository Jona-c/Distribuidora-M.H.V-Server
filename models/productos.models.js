const mongoose = require('mongoose');

const ProductosSchema = new mongoose.Schema({
    nombre: String,
    imagen : String,
    codigo : String,
    precio: Number,
    fecha_actualizacion: {
        type: Date,
        default: Date.now
    },
    categoria: String,
    en_stock: Boolean,
    
});

module.exports = mongoose.model('Productos', ProductosSchema);