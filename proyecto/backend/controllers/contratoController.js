const Contrato = require('../models/contratoModel');

// 1. Obtener contratos (Con seguridad inyectada)
const getContratos = async (req, res) => {
    try {
        // Pasamos el usuario completo al Modelo para que decida qué SQL ejecutar
        const contratos = await Contrato.obtenerActivos(req.usuario);
        res.json(contratos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener contratos' });
    }
};

// 2. Crear un nuevo contrato
const crearContrato = async (req, res) => {
    try {
        const nuevoContrato = await Contrato.crear(req.body);
        res.status(201).json(nuevoContrato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear contrato' });
    }
};

// 3. Asignar un Asesor a un Contrato
const asignarAsesor = async (req, res) => {
    const { id_contrato, id_usuario } = req.body;
    try {
        await Contrato.asignarAsesor(id_contrato, id_usuario);
        res.json({ mensaje: 'Asesor asignado correctamente al contrato' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al asignar asesor' });
    }
};

// 4. Eliminación Lógica
const eliminarContrato = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Contrato.desactivar(id);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Contrato no encontrado' });
        }
        
        res.json({ mensaje: 'Contrato desactivado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar contrato' });
    }
};

module.exports = { getContratos, crearContrato, asignarAsesor, eliminarContrato };