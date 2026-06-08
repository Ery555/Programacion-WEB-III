const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. No hay token.' });
    }

    try {
        const soloToken = token.split(' ')[1]; 
        // Verificamos si el token es válido y no ha expirado
        const cifrado = jwt.verify(soloToken, process.env.JWT_SECRET);
        req.usuario = cifrado; 
        
        next();
    } catch (error) {
        res.status(400).json({ mensaje: 'Token no válido' });
    }
};
const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado: Se requieren privilegios de Administrador' });
    }
    next();
};

module.exports = { verificarToken, esAdmin };