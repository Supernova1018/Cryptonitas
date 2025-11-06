// index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno desde .env
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');
const tradeRoutes = require('./routes/trade');   
const portafolioRoutes = require('./routes/portafolio');
const aiRoutes = require('./routes/ai');

// Inicializar la app de Express
const app = express();

// --- Middlewares ---
// 1. CORS: Permite que tu frontend (ej. en localhost:3000)
//    pueda hacerle peticiones a tu backend (en localhost:5000)
app.use(cors());

// 2. express.json: Permite que el servidor entienda
//    el formato JSON que envía el frontend (ej. en req.body)
app.use(express.json());

// --- Definir Rutas de la API ---
app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);    
app.use('/api/trade', tradeRoutes);      
app.use('/api/portafolio', portafolioRoutes);
app.use('/api/ai', aiRoutes);

// Definir el puerto
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});