const pool = require('../config/db');

class Aseguradora {
    // 1. Obtener todas las aseguradoras activas
    static async obtenerActivas() {
        const result = await pool.query(
            'SELECT * FROM aseguradora WHERE is_active = true ORDER BY nombre ASC'
        );
        return result.rows;
    }

    // 2. Crear una nueva aseguradora
    static async crear(datos) {
        const { nombre, nit, direccion, telefono } = datos;
        const result = await pool.query(
            `INSERT INTO aseguradora (nombre, nit, direccion, telefono) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [nombre, nit, direccion, telefono]
        );
        return result.rows[0];
    }

    // 3. Dar de baja (Eliminación Lógica)
    static async desactivar(id_aseguradora) {
        const result = await pool.query(
            'UPDATE aseguradora SET is_active = false WHERE id_aseguradora = $1 RETURNING *',
            [id_aseguradora]
        );
        return result; // Retornamos el objeto result completo para que el controlador valide el rowCount
    }
}

module.exports = Aseguradora;