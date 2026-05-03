require('dotenv').config();
const app = require('./app.js');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`El servidor esta en ejecucion en http://localhost:${PORT} ✅`)
})