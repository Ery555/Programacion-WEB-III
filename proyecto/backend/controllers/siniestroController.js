const Siniestro = require('../models/siniestroModel');

// 1. Obtener siniestros (Con seguridad inyectada)
const getSiniestros = async (req, res) => {
    try {
        const siniestros = await Siniestro.obtenerActivos(req.usuario);
        res.json(siniestros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener siniestros' });
    }
};

// 2. Registrar un nuevo siniestro
const crearSiniestro = async (req, res) => {
    try {
        const nuevoSiniestro = await Siniestro.crear(req.body);
        res.status(201).json(nuevoSiniestro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar el siniestro' });
    }
};

// 3. Actualizar el estado y/o monto indemnizado
const actualizarEstadoSiniestro = async (req, res) => {
    const { id } = req.params;
    const { estado, monto_indemnizado } = req.body;
    
    try {
        const result = await Siniestro.actualizarLiquidacion(id, estado, monto_indemnizado);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Siniestro no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el siniestro' });
    }
};

// 4. Eliminación Lógica
const eliminarSiniestro = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Siniestro.desactivar(id);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Siniestro no encontrado' });
        }
        res.json({ mensaje: 'Siniestro anulado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar siniestro' });
    }
};

module.exports = { getSiniestros, crearSiniestro, actualizarEstadoSiniestro, eliminarSiniestro };