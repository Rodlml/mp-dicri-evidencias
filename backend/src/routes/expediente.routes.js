const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');

const {
  crearExpediente,
  listarExpedientes,
  obtenerExpediente,
  cambiarEstado
} = require('../controllers/expediente.controller');

// Crear expediente (solo técnico o coordinador)
router.post('/', auth, crearExpediente);

// Listar expedientes (cualquier usuario logueado)
router.get('/', auth, listarExpedientes);

// Obtener expediente por ID
router.get('/:id', auth, obtenerExpediente);

// Cambiar estado (solo coordinador)
router.put('/:id/estado', auth, requireRole('coordinador'), cambiarEstado);

module.exports = router;
