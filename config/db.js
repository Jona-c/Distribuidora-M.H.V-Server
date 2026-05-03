//mongoose (trabajar con la base de datos)
const mongoose = require('mongoose');

//dotenv (obtener .env)
require('dotenv').config();


//conexion a nuestra base de datos (mongoDB)
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('LA CONEXION A LA BASE DE DATOS HA SIDO EXITOSA ✅')
    }catch (error) {
        console.log('ERROR EN LA BASE DE DATOS ❌ ' + error)
    }
}

module.exports = connectDB;