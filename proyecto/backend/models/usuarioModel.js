const pool = require('../config/db');

class Usuario {
    // 1. Buscar si un correo ya está registrado
    static async buscarPorEmail(email) {
        const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        return result.rows[0]; // Retorna el usuario o undefined si no existe
    }

    // 2. Guardar un nuevo usuario
    static async crear(datos) {
        const { nombre, email, passwordEncriptada, rol, item } = datos;
        const result = await pool.query(
            'INSERT INTO usuario (nombre, email, password, rol, item) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, email, rol',
            [nombre, email, passwordEncriptada, rol, item]
        );
        return result.rows[0];
    }

    // 3. Registrar auditoría de ingresos (Log)
    static async registrarLog(id_usuario, evento, ip, browser) {
        await pool.query(
            'INSERT INTO log_acceso (id_usuario, evento, ip_address, browser) VALUES ($1, $2, $3, $4)',
            [id_usuario, evento, ip, browser]
        );
    }

    // 4. Listar solo asesores activos
    static async obtenerAsesores() {
        const result = await pool.query('SELECT id_usuario, nombre, email, rol FROM usuario WHERE is_active = true');
        return result.rows;
    }

    // 5. Listar todos los usuarios para el panel de Admin
    static async obtenerTodos() {
        const result = await pool.query(
            'SELECT id_usuario, nombre, email, rol, item FROM usuario WHERE is_active = true ORDER BY id_usuario DESC'
        );
        return result.rows;
    }

    // 6. Dar de baja (eliminación lógica)
    static async desactivar(id_usuario) {
        const result = await pool.query(
            'UPDATE usuario SET is_active = false WHERE id_usuario = $1 RETURNING *',
            [id_usuario]
        );
        return result; // Retornamos todo el objeto result para que el controlador verifique el rowCount
    }
    static async obtenerLogs() {
        const result = await pool.query(`
            SELECT 
                l.id_log_acceso, 
                l.evento, 
                l.ip_address, 
                l.browser, 
                l.fecha_hora, 
                u.nombre AS usuario_nombre, 
                u.email AS usuario_email
            FROM log_acceso l
            JOIN usuario u ON l.id_usuario = u.id_usuario
            ORDER BY l.fecha_hora DESC
            LIMIT 200 -- Opcional: límite para no saturar la respuesta inicial
        `);
        return result.rows;
    }
}

module.exports = Usuario;