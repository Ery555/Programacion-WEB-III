const express = require('express');
const router = express.Router();
const { getContratos, crearContrato, asignarAsesor, eliminarContrato } = require('../controllers/contratoController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validarCampos');


router.get('/', verificarToken, getContratos);
router.post('/', [
    verificarToken, 
    esAdmin,
    check('codigo', 'El código es obligatorio').not().isEmpty(),
    check('importe', 'El importe debe ser un número válido').isFloat({ min: 0 }),
    check('fecha_inicio', 'La fecha de inicio no es válida').isISO8601(),
    check('fecha_fin', 'La fecha de fin no es válida').isISO8601(),
    validarCampos
], crearContrato);

router.post('/asignar', verificarToken, esAdmin, asignarAsesor);
router.put('/eliminar/:id', verificarToken, esAdmin, eliminarContrato);

module.exports = router;