const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema(
    {
        monto: { type: Number, required: true },
        fecha: { type: Date, default: Date.now },
    },
    { _id: true }
);

const CuentaCorrienteSchema = new mongoose.Schema(
    {
        pedidoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido', required: true, unique: true },
        nroPedido: { type: String, required: true },  // últimos 6 chars del _id del pedido
        cliente: {
            id:       { type: String, required: true },
            nombre:   { type: String, required: true },
            apellido: { type: String, required: true },
        },
        totalOriginal: { type: Number, required: true },
        totalRestante: { type: Number, required: true },
        estado: {
            type: String,
            enum: ['pendiente', 'pagado'],
            default: 'pendiente',
        },
        pagos: { type: [PagoSchema], default: [] },
        fechaPedido: { type: Date, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('CuentaCorriente', CuentaCorrienteSchema);