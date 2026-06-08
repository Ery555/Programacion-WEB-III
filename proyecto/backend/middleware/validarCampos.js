const { validationResult } = require('express-validator');

const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    
    // Si la lista de errores NO está vacía, bloqueamos la petición
    if (!errores.isEmpty()) {
        return res.status(400).json({ 
            mensaje: 'Error de validación en los datos',
            errores: errores.array() 
        });
    }

    next();
};

module.exports = { validarCampos };