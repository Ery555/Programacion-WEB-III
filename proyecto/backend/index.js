const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const { verificarToken } = require('./middleware/authMiddleware');
const clienteRoutes = require('./routes/clienteRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const aseguradoraRoutes = require('./routes/aseguradoraRoutes');
const polizaRoutes = require('./routes/polizaRoutes');
const siniestroRoutes = require('./routes/siniestroRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const originesPermitidos = [
    'https://proy-prog-web-3.vercel.app',
    'http://localhost:5173'
];
const corsOptions = {
    origin: originesPermitidos,
    credentials: true,
    optionsSuccessStatus: 200
};
const path = require('path');
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            mensaje: 'Servidor y Base de Datos conectados 🚀',
            hora_db: result.rows[0].now
        });
    } catch (err) {
        res.status(500).send('Error de conexión con la DB');
    }
});
app.use('/api/auth', authRoutes); // Aquí conectamos las rutas de autenticación
app.get('/api/perfil', verificarToken, (req, res) => {
    res.json({ mensaje: 'Bienvenido al área protegida', usuario: req.usuario });
});
app.use('/api/clientes', clienteRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/aseguradoras', aseguradoraRoutes);
app.use('/api/polizas', polizaRoutes);
app.use('/api/siniestros', siniestroRoutes);
app.use('/api/stats', statsRoutes);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});