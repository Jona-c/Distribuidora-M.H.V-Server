const mongoose = require('mongoose');

const PedidoItemSchema = new mongoose.Schema(
    {
        _id:      { type: String, required: true },
        nombre:   { type: String, required: true },
        codigo:   { type: String, required: true },
        precio:   { type: Number, required: true },
        cantidad: { type: Number, required: true },
        imagen:   { type: String },
    },
    { _id: false }
);

const PedidoSchema = new mongoose.Schema(
    {
        cliente: {
            id:       { type: String, required: true },
            nombre:   { type: String, required: true },
            apellido: { type: String, required: true },
        },
        items:    { type: [PedidoItemSchema], required: true },
        total:    { type: Number, required: true },
        fecha:    { type: Date, default: Date.now },
        revisado: { type: Boolean, default: false },
        estado:   {
            type:    String,
            enum:    ['pendiente', 'en_proceso', 'completado', 'cancelado'],
            default: 'pendiente',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Pedido', PedidoSchema);