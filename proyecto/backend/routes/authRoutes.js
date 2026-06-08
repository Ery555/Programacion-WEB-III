const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { validarCampos } = require('../middleware/validarCampos');
const { registrarUsuario, loginUsuario, getAsesores, getUsuarios, eliminarUsuario,registrarSalida, getLogsAcceso } = require('../controllers/authController');

router.post('/register', [
    verificarToken, 
    esAdmin,
    // --- REGLAS DE EXPRESS VALIDATOR ---
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'Debe ser un correo electrónico válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 8 caracteres').isLength({ min: 8 }),
    check('rol', 'El rol seleccionado no es válido').isIn(['admin', 'asesor']),
    validarCampos
], registrarUsuario);

router.post('/login', loginUsuario);
router.get('/asesores', verificarToken, getAsesores);
router.get('/', verificarToken, esAdmin, getUsuarios);
router.put('/eliminar/:id', verificarToken, esAdmin, eliminarUsuario);
router.post('/logout', verificarToken, registrarSalida);
router.get('/logs', verificarToken, esAdmin, getLogsAcceso)
module.exports = router;
