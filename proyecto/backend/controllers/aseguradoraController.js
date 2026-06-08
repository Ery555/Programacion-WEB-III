const Aseguradora = require('../models/aseguradoraModel');

// 1. Obtener todas las aseguradoras ACTIVAS
const getAseguradoras = async (req, res) => {
    try {
        const aseguradoras = await Aseguradora.obtenerActivas();
        res.json(aseguradoras);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener aseguradoras' });
    }
};

// 2. Crear una nueva aseguradora
const crearAseguradora = async (req, res) => {
    try {
        const nuevaAseguradora = await Aseguradora.crear(req.body);
        res.status(201).json(nuevaAseguradora);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear la aseguradora' });
    }
};

// 3. Eliminación Lógica
const eliminarAseguradora = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Aseguradora.desactivar(id);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Aseguradora no encontrada' });
        }
        
        res.json({ mensaje: 'Aseguradora desactivada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar aseguradora' });
    }
};

module.exports = { getAseguradoras, crearAseguradora, eliminarAseguradora };