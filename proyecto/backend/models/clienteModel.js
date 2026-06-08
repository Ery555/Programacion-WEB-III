const pool = require('../config/db');

class Cliente {
    // 1. Obtener clientes (Filtrado por ROL)
    static async obtenerActivos(usuarioAuth) {
        if (usuarioAuth.rol === 'admin') {
            // El admin ve TODOS los clientes
            const result = await pool.query(
                'SELECT * FROM cliente WHERE is_active = true ORDER BY id_cliente ASC'
            );
            return result.rows;
        } else {
            // El asesor SOLO ve los clientes asociados a los contratos que tiene asignados
            // Usamos DISTINCT para no duplicar al cliente si el asesor tiene varios contratos con la misma empresa
            const query = `
                SELECT DISTINCT c.* FROM cliente c
                JOIN contrato_servicios cs ON c.id_cliente = cs.id_cliente
                JOIN usuario_contrato uc ON cs.id_contrato = uc.id_contrato
                WHERE c.is_active = true AND uc.id_usuario = $1 AND cs.is_active = true
                ORDER BY c.id_cliente ASC
            `;
            const result = await pool.query(query, [usuarioAuth.id]);
            return result.rows;
        }
    }

    // 2. Crear un nuevo cliente
    static async crear(datos) {
        const { 
            nombre, sigla, nit, direccion, 
            representante_nombre, representante_email, representante_telefono,
            contacto_nombre, contacto_cargo, contacto_email, contacto_telefono
        } = datos;

        const result = await pool.query(
            `INSERT INTO cliente 
            (nombre, sigla, nit, direccion, representante_nombre, representante_email, representante_telefono, contacto_nombre, contacto_cargo, contacto_email, contacto_telefono) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
            [nombre, sigla, nit, direccion, representante_nombre, representante_email, representante_telefono, contacto_nombre, contacto_cargo, contacto_email, contacto_telefono]
        );
        return result.rows[0];
    }

    // 3. Dar de baja (Eliminación Lógica)
    static async desactivar(id_cliente) {
        const result = await pool.query(
            'UPDATE cliente SET is_active = false WHERE id_cliente = $1 RETURNING *', 
            [id_cliente]
        );
        return result; 
    }
}

module.exports = Cliente;