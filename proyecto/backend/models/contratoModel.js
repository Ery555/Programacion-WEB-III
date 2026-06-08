const pool = require('../config/db');

class Contrato {
    // 1. Obtener contratos (Filtrado por ROL)
    static async obtenerActivos(usuarioAuth) {
        if (usuarioAuth.rol === 'admin') {
            // El admin ve TODOS los contratos
            const query = `
                SELECT c.*, cl.nombre AS cliente_nombre 
                FROM contrato_servicios c
                JOIN cliente cl ON c.id_cliente = cl.id_cliente
                WHERE c.is_active = true
                ORDER BY c.fecha_fin ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } else {
            // El asesor SOLO ve los contratos que le fueron asignados
            const query = `
                SELECT c.*, cl.nombre AS cliente_nombre 
                FROM contrato_servicios c
                JOIN cliente cl ON c.id_cliente = cl.id_cliente
                JOIN usuario_contrato uc ON c.id_contrato = uc.id_contrato
                WHERE c.is_active = true AND uc.id_usuario = $1
                ORDER BY c.fecha_fin ASC
            `;
            const result = await pool.query(query, [usuarioAuth.id]);
            return result.rows;
        }
    }

    // 2. Crear un nuevo contrato
    static async crear(datos) {
        const { id_cliente, codigo, objeto, fecha_inicio, fecha_fin, importe } = datos;
        const result = await pool.query(
            `INSERT INTO contrato_servicios (id_cliente, codigo, objeto, fecha_inicio, fecha_fin, importe) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id_cliente, codigo, objeto, fecha_inicio, fecha_fin, importe]
        );
        return result.rows[0];
    }

    // 3. Tabla intermedia: Asignar Asesor a Contrato
    static async asignarAsesor(id_contrato, id_usuario) {
        const result = await pool.query(
            'INSERT INTO usuario_contrato (id_contrato, id_usuario) VALUES ($1, $2) RETURNING *',
            [id_contrato, id_usuario]
        );
        return result.rows[0];
    }

    // 4. Eliminación Lógica
    static async desactivar(id_contrato) {
        const result = await pool.query(
            'UPDATE contrato_servicios SET is_active = false WHERE id_contrato = $1 RETURNING *',
            [id_contrato]
        );
        return result; 
    }
}

module.exports = Contrato;