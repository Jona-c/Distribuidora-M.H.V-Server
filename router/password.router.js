const express    = require('express');
const router     = express.Router();
const { verifyToken } = require('../middlewares/authenticated');
const {
    solicitarCodigo,
    verificarCodigo,
    resetearPassword,
    cambiarPassword,
} = require('../controllers/password.controller');

// Rutas públicas (sin token — flujo de olvidé mi contraseña)
router.post('/auth/solicitar-codigo',  solicitarCodigo);
router.post('/auth/verificar-codigo',  verificarCodigo);
router.post('/auth/resetear-password', resetearPassword);

// Ruta protegida (con token — cambiar desde el perfil)
router.put('/auth/cambiar-password', verifyToken, cambiarPassword);

module.exports = router;