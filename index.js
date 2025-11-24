// index.js
<<<<<<< HEAD
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require("./routes/auth");
const cryptoRoutes = require("./routes/crypto");
const tradeRoutes = require("./routes/trade");
const portafolioRoutes = require("./routes/portafolio");
const aiRoutes = require("./routes/ai");

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// === SERVIR FRONTEND CORRECTO ===
// ⚠ Ajusta esta ruta EXACTAMENTE a tu estructura real:
const FRONTEND_PATH = path.join(__dirname, "front", "cryptoia");
app.use(express.static(FRONTEND_PATH));


// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/crypto", cryptoRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/portafolio", portafolioRoutes);
app.use("/api/ai", aiRoutes);


// === MANEJO DE RUTAS DEL FRONTEND ===
//  Permite abrir rutas como:
//  http://localhost:5000/login/login.html
//  http://localhost:5000/admin/admin.html
//  http://localhost:5000/index.html
app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

app.get("/login/login.html", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "..", "login", "login.html"));
});

app.get("/admin/admin.html", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "..", "admin", "admin.html"));
});

app.get("/trade/trade.html", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "trade", "trade.html"));
});


// Cualquier otra ruta que no sea API → enviar index.html
// (Útil si después vuelves tu proyecto tipo SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});


// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`);
});
=======
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
>>>>>>> db95fda9d11242de247891108d7190d9527916be
