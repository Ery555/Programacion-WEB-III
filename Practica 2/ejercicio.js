import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'practica2'
});

app.get('/', (req, res) => {
    res.send('API de Categorías corriendo para la Práctica 2');
});


// 1. POST /categorias
// Registrar una nueva categoría
app.post('/categorias', async (req, res) => {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    try {
        const [resultado] = await pool.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion]
        );
        res.status(201).json({ id: resultado.insertId, nombre, descripcion });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


// 2. GET /categorias
// Devolver todas las categorías registradas
app.get('/categorias', async (req, res) => {
    try {
        const [resultado] = await pool.query('SELECT * FROM categorias');
        res.send(resultado);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 3. GET /categorias/:id
// Devolver la categoría con su ID e incluir sus productos asociados
app.get('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [catResultado] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);
        
        if (catResultado.length === 0) {
            return res.status(404).send({ mensaje: 'Categoría no encontrada' });
        }

        const [prodResultado] = await pool.query('SELECT * FROM productos WHERE categoria_id = ?', [id]);

        const categoria = catResultado[0];
        categoria.productos = prodResultado;

        res.send(categoria);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 4. PATCH /categorias/:id
// Actualizar todos los datos de la categoría especificada
app.patch('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    try {
        const [resultado] = await pool.query(
            'UPDATE categorias SET nombre = ?, descripcion = ?, updatedAt = NOW() WHERE id = ?',
            [nombre, descripcion, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).send({ mensaje: 'Categoría no encontrada' });
        }

        res.send({ mensaje: 'CATEGORÍA ACTUALIZADA CORRECTAMENTE' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// 5. DELETE /categorias/:id
// Eliminar la categoría y automáticamente sus productos relacionados
app.delete('/categorias/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE categoria_id = ?', [id]);

        const [resultado] = await pool.query('DELETE FROM categorias WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).send({ mensaje: 'Categoría no encontrada' });
        }

        res.send({ mensaje: 'CATEGORÍA Y PRODUCTOS ASOCIADOS ELIMINADOS' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Configuración del Puerto del Servidor
const PUERTO = 3001;
app.listen(PUERTO, () => {
    console.log(`Servidor Backend corriendo en: http://localhost:${PUERTO}`);
});