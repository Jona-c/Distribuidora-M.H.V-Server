const Producto = require('../models/productos.models');
const imagen = require('../utils/imagenes');

// crear productos
async function crearProducto(req, res) {

    //obtener productos
    const nuevoProducto = new Producto(req.body);

    //agregar imagen al producto
    if (req.files.imagen) {
        const imagenPath = imagen.getFileName(req.files.imagen);
        nuevoProducto.imagen = imagenPath;
    }


    //guardar producto en la DB 
    try {
        await nuevoProducto.save();
        res.status(201).send({ msg: 'Producto guardado correctamente ✅' });
    }catch(err){
        res.status(500).send({ msg: `Error al crear el producto ❌ ${err}` });
    }

}

//obtener productos
async function obtenerProductos(req, res) {
    try {
            const productos = await Producto.find();
            if (!productos.length) {
                return res.status(404).send({ msg: 'No se han encontrado productos' });
        }
        res.status(200).send(productos);
        } catch (error) {
            console.error(error);
            return res.status(500).send({ msg: `Error al obtener los productos ❌ ${error}` });
        }
}

//editar productos
async function editarProducto(req, res) {
    const { id } = req.params;
    
    //obtener productos
    const nuevoProducto = req.body;
    
    try{
         // Convertir fecha desde Multipart
        if (nuevoProducto.fecha_actualizacion) {
            const fecha = new Date(nuevoProducto.fecha_actualizacion);
            if (!isNaN(fecha)) {
                nuevoProducto.fecha_actualizacion = fecha;
            } else {
                delete nuevoProducto.fecha_actualizacion;
            }
        } else {
            nuevoProducto.fecha_actualizacion = new Date();
        }

        //agregar imagen al producto
        if (req.files.imagen) {
            const imagenPath = imagen.getFileName(req.files.imagen);
            nuevoProducto.imagen = imagenPath;
        } 

        
        //actualizar producto en la DB 
        
        await Producto.findByIdAndUpdate(id, nuevoProducto, {
            new: true,
            runValidators: true
        });
        
            res.status(200).send({ msg: 'Actualizacion de producto exitoso ✅' });
        }catch(err){
            res.status(500).send({ msg: `Error al actualizar el producto ❌ ${err}` });
    }

}

//eliminar productos
async function eliminarProducto(req, res) {
    const { id } = req.params;

    try {
        await Producto.findByIdAndDelete(id);
        res.status(200).send({ msg: 'Producto eliminado correctamente ✅' });
    }catch(error){
        res.status(400).send({ msg: 'Error al eliminar el producto' });
    }
}

//obtener peliculas con paginacion 
// y crear nuestra propia API pegando la URL (http://localhost:5000/api/ObtenerProductosPaginados?page=1&limit=3)=> INSOMNIA al navegador, ya previamente teniendo la DB creada
async function obtenerProductosPaginados(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const categoria = req.query.categoria || null;
    const busqueda = req.query.busqueda || null;

    const skip = (page - 1) * limit;

    // Construir filtro combinando categoría y búsqueda
    const filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (busqueda) {
        filtro.$or = [
            { nombre: { $regex: busqueda, $options: 'i' } },
            { codigo: { $regex: busqueda, $options: 'i' } }
        ];
    }

    try {
        const productos = await Producto.find(filtro).skip(skip).limit(limit);
        const total = await Producto.countDocuments(filtro);
        const totalPages = Math.ceil(total / limit);

        const baseUrl = `http://localhost:5000/api/ObtenerProductosPaginados?limit=${limit}` +
            (categoria ? `&categoria=${encodeURIComponent(categoria)}` : '') +
            (busqueda  ? `&busqueda=${encodeURIComponent(busqueda)}`   : '');
        const next = page < totalPages ? `${baseUrl}&page=${page + 1}` : null;
        const prev = page > 1         ? `${baseUrl}&page=${page - 1}` : null;

        const response = {
            info: {
                count: total,
                pages: totalPages,
                next,
                prev
            },
            results: productos,
        };

        res.status(200).send(response);

    } catch(error) {
        res.status(500).send({ mensaje: 'Error al obtener los productos', error });
    }
}


module.exports = {
    crearProducto,
    obtenerProductos,
    editarProducto,
    eliminarProducto,
    obtenerProductosPaginados,
};