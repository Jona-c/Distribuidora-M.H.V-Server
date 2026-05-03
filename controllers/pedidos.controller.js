const Pedido = require('../models/pedido');
const CuentaCorriente = require('../models/CuentaCorriente');

// POST /api/pedidos
const crearPedido = async (req, res) => {
    try {
        const { items, total, cliente } = req.body;
        const clienteData = {
            id:       req.user.user_id,
            nombre:   cliente?.nombre   || '',
            apellido: cliente?.apellido || '',
        };
        if (!items || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({ msg: 'El carrito está vacío.' });
        if (typeof total !== 'number' || total <= 0)
            return res.status(400).json({ msg: 'El total del pedido es inválido.' });
        if (!clienteData.nombre || !clienteData.apellido)
            return res.status(400).json({ msg: 'Faltan datos del cliente.' });

        const nuevoPedido = await Pedido.create({
            cliente: clienteData, items, total, revisado: false, estado: 'pendiente',
        });
        return res.status(201).json({ msg: 'Pedido creado correctamente.', pedido: nuevoPedido });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// GET /api/pedidos
const obtenerPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find().sort({ fecha: -1 });
        return res.status(200).json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// GET /api/pedidos/mis-pedidos
const obtenerMisPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find({ 'cliente.id': req.user.user_id }).sort({ fecha: -1 });
        return res.status(200).json(pedidos);
    } catch (error) {
        console.error('Error al obtener mis pedidos:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// GET /api/pedidos/sin-revisar/count
const contarSinRevisar = async (req, res) => {
    try {
        const count = await Pedido.countDocuments({ revisado: false });
        return res.status(200).json({ count });
    } catch (error) {
        console.error('Error al contar pedidos sin revisar:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// PUT /api/pedidos/marcar-revisados
const marcarRevisados = async (req, res) => {
    try {
        const resultado = await Pedido.updateMany({ revisado: false }, { $set: { revisado: true } });
        return res.status(200).json({ msg: 'Pedidos marcados como revisados.', actualizados: resultado.modifiedCount });
    } catch (error) {
        console.error('Error al marcar pedidos como revisados:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// PUT /api/pedidos/:id/confirmar
// ★ También crea automáticamente la entrada en Cuenta Corriente
const confirmarPedido = async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { $set: { estado: 'completado' } },
            { new: true }
        );
        if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado.' });

        // Crear entrada en cuenta corriente si no existe ya
        const existe = await CuentaCorriente.findOne({ pedidoId: pedido._id });
        if (!existe) {
            await CuentaCorriente.create({
                pedidoId:      pedido._id,
                nroPedido:     pedido._id.toString().slice(-6).toUpperCase(),
                cliente:       pedido.cliente,
                totalOriginal: pedido.total,
                totalRestante: pedido.total,
                estado:        'pendiente',
                pagos:         [],
                fechaPedido:   pedido.fecha,
            });
        }

        return res.status(200).json({ msg: 'Pedido confirmado correctamente.', pedido });
    } catch (error) {
        console.error('Error al confirmar pedido:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// PUT /api/pedidos/:id/cancelar
const cancelarPedido = async (req, res) => {
    try {
        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { $set: { estado: 'cancelado' } },
            { new: true }
        );
        if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado.' });
        return res.status(200).json({ msg: 'Pedido cancelado correctamente.', pedido });
    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

module.exports = {
    crearPedido, obtenerPedidos, obtenerMisPedidos,
    contarSinRevisar, marcarRevisados, confirmarPedido, cancelarPedido,
};