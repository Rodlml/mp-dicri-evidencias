const authRoutes = require('./routes/auth.routes');
const expedienteRoutes = require('./routes/expediente.routes');
const indicioRoutes = require('./routes/indicio.routes');
const reporteRoutes = require('./routes/reporte.routes');



require('dotenv').config();

console.log("ENV TEST");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const express = require('express');
const cors = require('cors');
const { getPool } = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/expedientes', expedienteRoutes);
app.use('/api', indicioRoutes);
app.use('/api/reportes', reporteRoutes);


const authMiddleware = require('./middlewares/auth');
const { requireRole } = require('./middlewares/roles');

app.get('/api/protegido', authMiddleware, (req, res) => {
  res.json({
    message: 'Acceso permitido',
    user: req.user
  });
});

// Ejemplo solo coordinador:
app.get(
  '/api/solo-coordinador',
  authMiddleware,
  requireRole('coordinador'),
  (req, res) => {
    res.json({
      message: 'Hola coordinador',
      user: req.user
    });
  }
);


// Endpoint de prueba
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT 1 AS ok;');

    return res.json({
      status: 'ok',
      db: result.recordset[0].ok === 1
    });
  } catch (err) {
    console.error('Error en /api/health:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API escuchando en el puerto ${PORT}`);
});
