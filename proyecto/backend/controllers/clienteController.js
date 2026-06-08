const Cliente = require('../models/clienteModel'); 

// 1. Obtener clientes (Con seguridad inyectada)
const getClientes = async (req, res) => {
    try {
        // Pasamos el usuario decodificado desde el token al Modelo
        const clientes = await Cliente.obtenerActivos(req.usuario); 
        res.json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener clientes' });
    }
};

// 2. Crear un nuevo cliente con todos los campos
const crearCliente = async (req, res) => {
    try {
        const nuevoCliente = await Cliente.crear(req.body); 
        res.status(201).json(nuevoCliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear cliente' });
    }
};

// 3. Eliminación Lógica
const eliminarCliente = async (req, res) => {
    const { id } = req.params; 
    try {
        const result = await Cliente.desactivar(id); 
        
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
        
        res.json({ mensaje: 'Cliente desactivado correctamente', cliente: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar cliente' });
    }
};

module.exports = { getClientes, crearCliente, eliminarCliente };