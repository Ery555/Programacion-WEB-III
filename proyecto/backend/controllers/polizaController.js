const Poliza = require('../models/polizaModel');

// 1. Obtener pólizas (Con seguridad de datos inyectada)
const getPolizas = async (req, res) => {
    try {
        const polizas = await Poliza.obtenerActivas(req.usuario);
        res.json(polizas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener pólizas' });
    }
};

// 2. Crear una nueva póliza
const crearPoliza = async (req, res) => {
    try {
        const nuevaPoliza = await Poliza.crear(req.body);
        res.status(201).json(nuevaPoliza);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ mensaje: 'El número de póliza ya está registrado.' });
        }
        res.status(500).json({ mensaje: 'Error al crear póliza' });
    }
};

// 3. Eliminación Lógica
const eliminarPoliza = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Poliza.desactivar(id);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Póliza no encontrada' });
        }
        
        res.json({ mensaje: 'Póliza anulada/desactivada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar póliza' });
    }
};

// 4. Subir documento PDF a una póliza existente
const subirDocumento = async (req, res) => {
    const { id } = req.params; 
    
    if (!req.file) {
        return res.status(400).json({ mensaje: 'No se envió ningún archivo o el formato es incorrecto' });
    }

    const rutaDocumento = `/uploads/polizas/${req.file.filename}`;

    try {
        const result = await Poliza.actualizarDocumento(id, rutaDocumento);

        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Póliza no encontrada' });
        }

        res.json({ 
            mensaje: 'Documento subido exitosamente', 
            ruta: rutaDocumento,
            poliza: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar la ruta del documento en la base de datos' });
    }
};

module.exports = { getPolizas, crearPoliza, eliminarPoliza, subirDocumento };