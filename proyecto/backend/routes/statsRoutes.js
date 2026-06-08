const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
// Solo el admin puede ver las estadísticas
router.get('/', verificarToken, esAdmin, getDashboardStats);

module.exports = router;