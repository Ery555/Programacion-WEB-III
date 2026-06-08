const multer = require('multer');
const path = require('path');

// 1. Configuración del almacenamiento (Storage)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, 'uploads/polizas/'); 
    },
    filename: function (req, file, cb) {
        // Generamos un nombre único: FechaActual-NombreOriginal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Filtro de archivos (Solo permitir PDFs)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Formato no válido. Solo se permiten archivos PDF.'), false); // Rechazar
    }
};

// 3. Exportar el middleware configurado
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;