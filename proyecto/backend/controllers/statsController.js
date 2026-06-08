const Stats = require('../models/statsModel');

const getDashboardStats = async (req, res) => {
    try {
        const estadisticas = await Stats.obtenerEstadisticasDashboard();
        
        res.json(estadisticas);
        
    } catch (error) {
        console.error('Error al compilar estadísticas del sistema:', error);
        res.status(500).json({ mensaje: 'Error al procesar las estadísticas en el servidor' });
    }
};

module.exports = { getDashboardStats };