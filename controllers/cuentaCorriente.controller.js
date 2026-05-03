const CuentaCorriente = require('../models/CuentaCorriente');


// POST /api/cuenta-corriente
// Se llama automáticamente cuando el admin confirma un pedido.
// Crea la entrada en cuenta corriente como "pendiente".

const crearEntrada = async (req, res) => {
    try {
        const { pedidoId, nroPedido, cliente, totalOriginal, fechaPedido } = req.body;

        // Evitar duplicados si se llama dos veces por error
        const existe = await CuentaCorriente.findOne({ pedidoId });
        if (existe) {
            return res.status(200).json({ msg: 'Ya existe una entrada para este pedido.', entrada: existe });
        }

        const nueva = await CuentaCorriente.create({
            pedidoId,
            nroPedido,
            cliente,
            totalOriginal,
            totalRestante: totalOriginal,
            estado: 'pendiente',
            pagos: [],
            fechaPedido,
        });

        return res.status(201).json({ msg: 'Entrada creada correctamente.', entrada: nueva });
    } catch (error) {
        console.error('Error al crear entrada cuenta corriente:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};


// GET /api/cuenta-corriente
// Admin: todas las entradas

const obtenerTodas = async (req, res) => {
    try {
        const entradas = await CuentaCorriente.find().sort({ fechaPedido: -1 });
        return res.status(200).json(entradas);
    } catch (error) {
        console.error('Error al obtener cuenta corriente:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};


// GET /api/cuenta-corriente/mis-entradas
// Cliente: solo sus propias entradas

const obtenerMisEntradas = async (req, res) => {
    try {
        const entradas = await CuentaCorriente.find({ 'cliente.id': req.user.user_id }).sort({ fechaPedido: -1 });
        return res.status(200).json(entradas);
    } catch (error) {
        console.error('Error al obtener mis entradas:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};


// PUT /api/cuenta-corriente/:id/registrar-pago
// Admin: marca la deuda como pagada completamente (totalRestante = 0)

const registrarPago = async (req, res) => {
    try {
        const entrada = await CuentaCorriente.findById(req.params.id);
        if (!entrada) return res.status(404).json({ msg: 'Entrada no encontrada.' });
        if (entrada.estado === 'pagado') return res.status(400).json({ msg: 'Esta cuenta ya está pagada.' });

        entrada.pagos.push({ monto: entrada.totalRestante, fecha: new Date() });
        entrada.totalRestante = 0;
        entrada.estado = 'pagado';
        await entrada.save();

        return res.status(200).json({ msg: 'Pago registrado correctamente.', entrada });
    } catch (error) {
        console.error('Error al registrar pago:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};


// PUT /api/cuenta-corriente/:id/restar-pago
// Admin: resta un monto parcial de la deuda

const restarPago = async (req, res) => {
    try {
        const { monto } = req.body;

        if (typeof monto !== 'number' || monto <= 0) {
            return res.status(400).json({ msg: 'El monto debe ser un número mayor a 0.' });
        }

        const entrada = await CuentaCorriente.findById(req.params.id);
        if (!entrada) return res.status(404).json({ msg: 'Entrada no encontrada.' });
        if (entrada.estado === 'pagado') return res.status(400).json({ msg: 'Esta cuenta ya está pagada.' });

        const nuevoRestante = entrada.totalRestante - monto;

        if (nuevoRestante < 0) {
            return res.status(400).json({ msg: `El monto ingresado ($${monto}) supera la deuda restante ($${entrada.totalRestante}).` });
        }

        entrada.pagos.push({ monto, fecha: new Date() });
        entrada.totalRestante = nuevoRestante;

        // Si llegó a 0, marcar como pagado automáticamente
        if (nuevoRestante === 0) entrada.estado = 'pagado';

        await entrada.save();

        return res.status(200).json({ msg: 'Pago parcial registrado.', entrada });
    } catch (error) {
        console.error('Error al restar pago:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

module.exports = { crearEntrada, obtenerTodas, obtenerMisEntradas, registrarPago, restarPago };