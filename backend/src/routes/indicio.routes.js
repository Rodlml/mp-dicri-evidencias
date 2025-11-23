const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const {
  crearIndicio,
  listarIndiciosPorExpediente,
  obtenerIndicio,
  eliminarIndicio
} = require('../controllers/indicio.controller');

// Crear indicio en un expediente (técnico o coordinador)
router.post(
  '/expedientes/:id_expediente/indicios',
  auth,
  crearIndicio
);

// Listar indicios de un expediente
router.get(
  '/expedientes/:id_expediente/indicios',
  auth,
  listarIndiciosPorExpediente
);

// Obtener indicio individual
router.get(
  '/indicios/:id',
  auth,
  obtenerIndicio
);

// Eliminar indicio (solo coordinador, por ejemplo)
router.delete(
  '/indicios/:id',
  auth,
  requireRole('coordinador'),
  eliminarIndicio
);

module.exports = router;
