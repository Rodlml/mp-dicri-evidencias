const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const {
  resumenExpedientes,
  detalleExpedientes
} = require('../controllers/reporte.controller');

// Resumen de registros, aprobaciones y rechazos (con filtros de fecha)
router.get(
  '/expedientes-resumen',
  auth,
  requireRole('coordinador'),
  resumenExpedientes
);

// Detalle de expedientes con filtros por fechas y estado
router.get(
  '/expedientes-detalle',
  auth,
  requireRole('coordinador'),
  detalleExpedientes
);

module.exports = router;
