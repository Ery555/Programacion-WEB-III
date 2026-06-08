const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función auxiliar para medir la fuerza de la contraseña
const calcularFuerzaPassword = (password) => {
    const tieneLetras = /[a-zA-Z]/.test(password);
    const tieneNumeros = /\d/.test(password);
    const tieneSimbolos = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= 12 && tieneLetras && tieneNumeros && tieneSimbolos) {
        return "Fuerte";
    } else if (password.length >= 8 && tieneLetras && tieneNumeros) {
        return "Intermedia";
    } else {
        return "Débil";
    }
};

const registrarUsuario = async (req, res) => {
    const { nombre, email, password, rol, item } = req.body;

    try {
        // 1. Validar nivel de contraseña
        const nivelSeguridad = calcularFuerzaPassword(password);
        if (nivelSeguridad === "Débil") {
            return res.status(400).json({
                mensaje: 'La contraseña es muy débil. Debe tener al menos 8 caracteres y combinar letras y números.'
            });
        }

        // 2. Verificar existencia usando el MODELO
        const usuarioExiste = await Usuario.buscarPorEmail(email);
        if (usuarioExiste) {
            return res.status(400).json({ mensaje: 'El usuario ya está registrado' });
        }

        // 3. Encriptar
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // 4. Guardar usando el MODELO
        const nuevoUsuario = await Usuario.crear({ nombre, email, passwordEncriptada, rol, item });

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            nivelSeguridad, 
            usuario: nuevoUsuario
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor al registrar' });
    }
};

const loginUsuario = async (req, res) => {
    // 1. Extraemos el captchaToken que ahora nos envía el Frontend
    const { email, password, captchaToken } = req.body; 

    try {
        // 2. Seguridad perimetral: Si no hay token, rechazamos la petición inmediatamente
        if (!captchaToken) {
            return res.status(400).json({ mensaje: 'Es obligatorio validar el CAPTCHA' });
        }

        // 3. Consultar a los servidores de Google para verificar la autenticidad del token
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
        
        const googleResponse = await fetch(googleVerifyUrl, { method: 'POST' });
        const googleData = await googleResponse.json();

        // Si Google dice que el token es falso o expiró, bloqueamos el acceso
        if (!googleData.success) {
            return res.status(403).json({ mensaje: 'La validación del CAPTCHA ha fallado. Detectado posible bot.' });
        }

        // --- A PARTIR DE AQUÍ, ES EL LOGIN NORMAL Y SEGURO ---

        // Consultar a la base de datos a través del MODELO
        const usuario = await Usuario.buscarPorEmail(email);

        if (!usuario) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(400).json({ mensaje: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol }, 
            process.env.JWT_SECRET,               
            { expiresIn: '8h' }                   
        );

        // Registro de LOG usando el MODELO
        const ip = req.ip || req.connection.remoteAddress;
        const browser = req.headers['user-agent'];
        await Usuario.registrarLog(usuario.id_usuario, 'Ingreso', ip, browser);

        res.status(200).json({
            mensaje: 'Login exitoso',
            token, 
            usuario: { id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor durante la autenticación' });
    }
};

const getAsesores = async (req, res) => {
    try {
        const asesores = await Usuario.obtenerAsesores();
        res.json(asesores);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener asesores' });
    }
};

const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.obtenerTodos();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener la lista de usuarios' });
    }
};

const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Usuario.desactivar(id); // Llamada al MODELO
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json({ mensaje: 'Usuario dado de baja correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
};
const registrarSalida = async (req, res) => {
    try {
        // Obtenemos el ID desde el token decodificado (req.usuario.id)
        const id_usuario = req.usuario.id; 
        
        // Extraer IP y Browser
        const ip = req.ip || req.connection.remoteAddress;
        const browser = req.headers['user-agent'];
        
        // Usamos tu Modelo directamente para registrar la "Salida"
        await Usuario.registrarLog(id_usuario, 'Salida', ip, browser);

        res.status(200).json({ mensaje: 'Salida del sistema registrada correctamente.' });
    } catch (error) {
        console.error('Error al registrar el log de salida:', error);
        res.status(500).json({ mensaje: 'Error interno al procesar el cierre de sesión.' });
    }
};
const getLogsAcceso = async (req, res) => {
    try {
        const logs = await Usuario.obtenerLogs();
        res.status(200).json(logs);
    } catch (error) {
        console.error('Error al obtener los logs de acceso:', error);
        res.status(500).json({ mensaje: 'Error interno al consultar la auditoría' });
    }
};

module.exports = { registrarUsuario, loginUsuario, getAsesores, getUsuarios, eliminarUsuario,registrarSalida, getLogsAcceso };