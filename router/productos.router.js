const express = require('express');
const { crearProducto, obtenerProductos, editarProducto, eliminarProducto, obtenerProductosPaginados } = require('../controllers/productos.controller.js');
const multiparty = require('connect-multiparty');
const md_upload = multiparty({ uploadDir: './uploads/productos' });

// crear rutas
const router = express.Router(); 

router.post("/Productos",[md_upload],crearProducto);
router.get("/ObtenerProductos",obtenerProductos);
router.put("/EditarProducto/:id",[md_upload],editarProducto);
router.delete("/EliminarProducto/:id", eliminarProducto);
router.get("/ObtenerProductosPaginados", obtenerProductosPaginados);

module.exports = router;