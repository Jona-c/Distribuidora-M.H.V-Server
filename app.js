const connectDB = require('./config/db.js');
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

// crear un servidor con express
const app = express();

// conexion a la base de datos
connectDB();

// configurar los cors
const allowedOrigins = [
    'https://distribuidora-mhv.netlify.app',
    'http://localhost:5000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));

// configurar body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configurar static folders
app.use(express.static('uploads'));

// importar rutas
const authRouter      = require('./router/auth.router.js');
const userRouter      = require('./router/user.router.js');
const productosRouter = require('./router/productos.router.js');
const pedidosRouter   = require('./router/pedidos.router.js'); 
const cuentaCorrienteRouter = require('./router/cuentaCorriente.router.js');
const passwordRouter        = require('./router/password.router.js')

// configurar rutas
app.use('/api', authRouter);       // http://localhost:5000/api/auth/register
app.use('/api', userRouter);       // http://localhost:5000/api/user/me
app.use('/api', productosRouter);  // http://localhost:5000/api/Productos
app.use('/api', pedidosRouter);    // http://localhost:5000/api/pedidos
app.use('/api', cuentaCorrienteRouter);  // http://localhost:5000/api/cuenta-corriente
app.use('/api', passwordRouter);  // http://localhost:5000/api/auth/solicitar-codigo

module.exports = app;