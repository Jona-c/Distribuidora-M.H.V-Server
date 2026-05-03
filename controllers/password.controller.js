const User      = require('../models/user.models.js');
const bcrypt    = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ── Configuración del transporter de email ──────────────────
// Usá tus credenciales SMTP en el .env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Helper: genera un código numérico de 6 dígitos
const generarCodigo = () => String(Math.floor(100000 + Math.random() * 900000));

// ─────────────────────────────────────────────────────────────
// POST /api/auth/solicitar-codigo
// Genera el código, lo guarda hasheado y manda el mail
// Body: { email }
// ─────────────────────────────────────────────────────────────
async function solicitarCodigo(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'El email es obligatorio.' });

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        // Por seguridad respondemos igual aunque el usuario no exista
        if (!user) return res.status(200).json({ msg: 'Si el email existe, recibirás el código.' });

        const codigo   = generarCodigo();
        const expira   = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        user.resetCode        = bcrypt.hashSync(codigo, 10);
        user.resetCodeExpires = expira;
        await user.save();

        await transporter.sendMail({
            from:    process.env.SMTP_FROM || process.env.SMTP_USER,
            to:      user.email,
            subject: 'Código de recuperación — Distribuidora M.H.V',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
                    <h2 style="color:#1a1a2e;margin-bottom:8px">Recuperación de contraseña</h2>
                    <p style="color:#555">Hola <strong>${user.nombre}</strong>, recibimos una solicitud para restablecer tu contraseña.</p>
                    <p style="color:#555">Tu código de verificación es:</p>
                    <div style="font-size:36px;font-weight:900;letter-spacing:10px;color:#DC2626;text-align:center;padding:20px 0">${codigo}</div>
                    <p style="color:#888;font-size:13px">Este código expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, ignorá este mail.</p>
                </div>
            `,
        });

        return res.status(200).json({ msg: 'Código enviado al email.' });
    } catch (error) {
        console.error('Error al solicitar código:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/verificar-codigo
// Verifica que el código sea correcto y no haya expirado
// Body: { email, codigo }
// ─────────────────────────────────────────────────────────────
async function verificarCodigo(req, res) {
    const { email, codigo } = req.body;
    if (!email || !codigo) return res.status(400).json({ msg: 'Email y código son obligatorios.' });

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.resetCode || !user.resetCodeExpires)
            return res.status(400).json({ msg: 'Código inválido o expirado.' });

        if (new Date() > user.resetCodeExpires)
            return res.status(400).json({ msg: 'El código ha expirado. Solicitá uno nuevo.' });

        const valido = bcrypt.compareSync(codigo, user.resetCode);
        if (!valido) return res.status(400).json({ msg: 'Código incorrecto.' });

        return res.status(200).json({ msg: 'Código verificado correctamente.' });
    } catch (error) {
        console.error('Error al verificar código:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/resetear-password
// Cambia la contraseña usando el código verificado
// Body: { email, codigo, nuevaPassword }
// ─────────────────────────────────────────────────────────────
async function resetearPassword(req, res) {
    const { email, codigo, nuevaPassword } = req.body;
    if (!email || !codigo || !nuevaPassword)
        return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });

    if (nuevaPassword.length < 6)
        return res.status(400).json({ msg: 'La contraseña debe tener al menos 6 caracteres.' });

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.resetCode || !user.resetCodeExpires)
            return res.status(400).json({ msg: 'Código inválido o expirado.' });

        if (new Date() > user.resetCodeExpires)
            return res.status(400).json({ msg: 'El código ha expirado. Solicitá uno nuevo.' });

        const valido = bcrypt.compareSync(codigo, user.resetCode);
        if (!valido) return res.status(400).json({ msg: 'Código incorrecto.' });

        // Guardar nueva contraseña y limpiar el código
        user.password         = bcrypt.hashSync(nuevaPassword, 10);
        user.resetCode        = null;
        user.resetCodeExpires = null;
        await user.save();

        return res.status(200).json({ msg: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error al resetear contraseña:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/cambiar-password
// Cambia la contraseña desde el perfil (requiere token)
// Body: { passwordActual, nuevaPassword }
// ─────────────────────────────────────────────────────────────
async function cambiarPassword(req, res) {
    const { passwordActual, nuevaPassword } = req.body;
    if (!passwordActual || !nuevaPassword)
        return res.status(400).json({ msg: 'Todos los campos son obligatorios.' });

    if (nuevaPassword.length < 6)
        return res.status(400).json({ msg: 'La nueva contraseña debe tener al menos 6 caracteres.' });

    try {
        // req.user viene del middleware verifyToken (user_id del JWT)
        const user = await User.findById(req.user.user_id);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });

        const esValida = bcrypt.compareSync(passwordActual, user.password);
        if (!esValida) return res.status(400).json({ msg: 'La contraseña actual es incorrecta.' });

        user.password = bcrypt.hashSync(nuevaPassword, 10);
        await user.save();

        return res.status(200).json({ msg: 'Contraseña cambiada correctamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
}

module.exports = { solicitarCodigo, verificarCodigo, resetearPassword, cambiarPassword };