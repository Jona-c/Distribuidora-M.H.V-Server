const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authenticated');
const {
    crearEntrada,
    obtenerTodas,
    obtenerMisEntradas,
    registrarPago,
    restarPago,
} = require('../controllers/cuentaCorriente.controller');

// Rutas fijas antes que las que tienen :id
router.post('/cuenta-corriente',                            verifyToken, crearEntrada);
router.get('/cuenta-corriente',                             verifyToken, obtenerTodas);
router.get('/cuenta-corriente/mis-entradas',                verifyToken, obtenerMisEntradas);
router.put('/cuenta-corriente/:id/registrar-pago',          verifyToken, registrarPago);
router.put('/cuenta-corriente/:id/restar-pago',             verifyToken, restarPago);

module.exports = router;