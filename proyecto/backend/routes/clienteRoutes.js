const express = require('express');
const router = express.Router();
const { getClientes, crearCliente, eliminarCliente } = require('../controllers/clienteController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validarCampos');


router.get('/', verificarToken, getClientes);
router.post('/', verificarToken, esAdmin, crearCliente);
router.put('/eliminar/:id', verificarToken, esAdmin, eliminarCliente);

module.exports = router;