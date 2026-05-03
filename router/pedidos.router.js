const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authenticated');
const {
    crearPedido,
    obtenerPedidos,
    obtenerMisPedidos,
    contarSinRevisar,
    marcarRevisados,
    confirmarPedido,
    cancelarPedido,
} = require('../controllers/pedidos.controller');

// ⚠️  Las rutas con paths fijos van SIEMPRE antes que las que tienen :id

router.post('/pedidos',                         verifyToken, crearPedido);
router.get('/pedidos',                          verifyToken, obtenerPedidos);
router.get('/pedidos/mis-pedidos',              verifyToken, obtenerMisPedidos);
router.get('/pedidos/sin-revisar/count',        verifyToken, contarSinRevisar);
router.put('/pedidos/marcar-revisados',         verifyToken, marcarRevisados);
router.put('/pedidos/:id/confirmar',            verifyToken, confirmarPedido);
router.put('/pedidos/:id/cancelar',             verifyToken, cancelarPedido);   // ★ NUEVO

module.exports = router;