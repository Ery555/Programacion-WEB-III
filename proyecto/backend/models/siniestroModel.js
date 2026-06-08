const pool = require('../config/db');

class Siniestro {
    // 1. Obtener todos los siniestros (Filtrado por ROL)
    static async obtenerActivos(usuarioAuth) {
        if (usuarioAuth.rol === 'admin') {
            // El admin ve TODOS los siniestros
            const query = `
                SELECT 
                    s.*, 
                    p.numero_codigo_poliza, 
                    c.nombre AS cliente_nombre, 
                    a.nombre AS aseguradora_nombre
                FROM siniestro s
                JOIN poliza_seguro p ON s.id_poliza = p.id_poliza
                JOIN cliente c ON p.id_cliente = c.id_cliente
                JOIN aseguradora a ON p.id_aseguradora = a.id_aseguradora
                WHERE s.is_active = true
                ORDER BY s.fecha_ocurrencia DESC
            `;
            const result = await pool.query(query);
            return result.rows;
        } else {
            // El asesor SOLO ve siniestros asociados a las pólizas de los clientes de sus contratos
            const query = `
                SELECT DISTINCT
                    s.*, 
                    p.numero_codigo_poliza, 
                    c.nombre AS cliente_nombre, 
                    a.nombre AS aseguradora_nombre
                FROM siniestro s
                JOIN poliza_seguro p ON s.id_poliza = p.id_poliza
                JOIN cliente c ON p.id_cliente = c.id_cliente
                JOIN aseguradora a ON p.id_aseguradora = a.id_aseguradora
                JOIN contrato_servicios cs ON c.id_cliente = cs.id_cliente
                JOIN usuario_contrato uc ON cs.id_contrato = uc.id_contrato
                WHERE s.is_active = true AND uc.id_usuario = $1 AND cs.is_active = true
                ORDER BY s.fecha_ocurrencia DESC
            `;
            const result = await pool.query(query, [usuarioAuth.id]);
            return result.rows;
        }
    }

    // 2. Registrar un nuevo siniestro (Incluyendo el campo JSONB)
    static async crear(datos) {
        const { 
            id_poliza, fecha_ocurrencia, fecha_denuncia, descripcion_general, 
            lugar, estado, monto_reclamado, tipo_bien, identificador_bien, 
            datos_especificos 
        } = datos;

        const result = await pool.query(
            `INSERT INTO siniestro 
            (id_poliza, fecha_ocurrencia, fecha_denuncia, descripcion_general, lugar, estado, monto_reclamado, tipo_bien, identificador_bien, datos_especificos) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [id_poliza, fecha_ocurrencia, fecha_denuncia, descripcion_general, lugar, estado, monto_reclamado, tipo_bien, identificador_bien, datos_especificos]
        );
        return result.rows[0];
    }

    // 3. Actualizar liquidación (Estado y Monto)
    static async actualizarLiquidacion(id_siniestro, estado, monto_indemnizado) {
        const result = await pool.query(
            'UPDATE siniestro SET estado = $1, monto_indemnizado = $2 WHERE id_siniestro = $3 RETURNING *',
            [estado, monto_indemnizado, id_siniestro]
        );
        return result;
    }

    // 4. Dar de baja (Eliminación Lógica)
    static async desactivar(id_siniestro) {
        const result = await pool.query(
            'UPDATE siniestro SET is_active = false WHERE id_siniestro = $1 RETURNING *',
            [id_siniestro]
        );
        return result;
    }
}

module.exports = Siniestro;