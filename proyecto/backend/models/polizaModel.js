const pool = require('../config/db');

class Poliza {
    // 1. Obtener pólizas (Filtrado por ROL)
    static async obtenerActivas(usuarioAuth) {
        if (usuarioAuth.rol === 'admin') {
            // El admin ve TODAS las pólizas
            const query = `
                SELECT 
                    p.*, 
                    c.nombre AS cliente_nombre, 
                    a.nombre AS aseguradora_nombre 
                FROM poliza_seguro p
                JOIN cliente c ON p.id_cliente = c.id_cliente
                JOIN aseguradora a ON p.id_aseguradora = a.id_aseguradora
                WHERE p.is_active = true
                ORDER BY p.fin_vigencia ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } else {
            // El asesor SOLO ve las pólizas de los clientes vinculados a sus contratos
            const query = `
                SELECT DISTINCT
                    p.*, 
                    c.nombre AS cliente_nombre, 
                    a.nombre AS aseguradora_nombre 
                FROM poliza_seguro p
                JOIN cliente c ON p.id_cliente = c.id_cliente
                JOIN aseguradora a ON p.id_aseguradora = a.id_aseguradora
                JOIN contrato_servicios cs ON c.id_cliente = cs.id_cliente
                JOIN usuario_contrato uc ON cs.id_contrato = uc.id_contrato
                WHERE p.is_active = true AND uc.id_usuario = $1 AND cs.is_active = true
                ORDER BY p.fin_vigencia ASC
            `;
            const result = await pool.query(query, [usuarioAuth.id]);
            return result.rows;
        }
    }

    // 2. Crear una nueva póliza
    static async crear(datos) {
        const { 
            id_cliente, id_aseguradora, numero_codigo_poliza, 
            tipo_poliza, direccion_poliza, inicio_vigencia, fin_vigencia 
        } = datos;

        const result = await pool.query(
            `INSERT INTO poliza_seguro 
            (id_cliente, id_aseguradora, numero_codigo_poliza, tipo_poliza, direccion_poliza, inicio_vigencia, fin_vigencia) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [id_cliente, id_aseguradora, numero_codigo_poliza, tipo_poliza, direccion_poliza, inicio_vigencia, fin_vigencia]
        );
        return result.rows[0];
    }

    // 3. Eliminación Lógica
    static async desactivar(id_poliza) {
        const result = await pool.query(
            'UPDATE poliza_seguro SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id_poliza = $1 RETURNING *',
            [id_poliza]
        );
        return result; 
    }

    // 4. Actualizar la ruta del documento PDF
    static async actualizarDocumento(id_poliza, rutaDocumento) {
        const result = await pool.query(
            'UPDATE poliza_seguro SET ruta_documento_poliza = $1, updated_at = CURRENT_TIMESTAMP WHERE id_poliza = $2 RETURNING *',
            [rutaDocumento, id_poliza]
        );
        return result;
    }
}

module.exports = Poliza;