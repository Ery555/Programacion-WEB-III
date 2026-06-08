const express = require('express');
const router = express.Router();
const { getPolizas, crearPoliza, eliminarPoliza, subirDocumento } = require('../controllers/polizaController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protegemos todas las rutas
router.get('/', verificarToken, getPolizas);
router.post('/', verificarToken, crearPoliza);
// Solo administradores pueden anular pólizas
router.put('/eliminar/:id', verificarToken, esAdmin, eliminarPoliza);
router.post('/:id/documento', verificarToken, upload.single('documento'), subirDocumento);


module.exports = router;