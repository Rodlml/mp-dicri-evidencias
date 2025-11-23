const { getPool, sql } = require('../config/db');

// Crear expediente
async function crearExpediente(req, res) {
  const { numero_expediente } = req.body;
  const id_tecnico = req.user.id_usuario; // viene del token

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('numero_expediente', sql.NVarChar(50), numero_expediente)
      .input('id_tecnico_registra', sql.Int, id_tecnico)
      .execute('sp_expediente_crear');

    return res.json({
      message: 'Expediente creado',
      id_expediente: result.recordset[0].id_expediente
    });

  } catch (err) {
    console.error('Error creando expediente:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Listar expedientes
async function listarExpedientes(req, res) {
  const { fecha_inicio, fecha_fin, estado } = req.query;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('fecha_inicio', sql.DateTime, fecha_inicio || null)
      .input('fecha_fin', sql.DateTime, fecha_fin || null)
      .input('estado', sql.NVarChar(20), estado || null)
      .execute('sp_expediente_listar');

    return res.json(result.recordset);

  } catch (err) {
    console.error('Error listando expedientes:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Obtener expediente por ID
async function obtenerExpediente(req, res) {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', sql.Int, id)
      .execute('sp_expediente_obtener');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(result.recordset[0]);

  } catch (err) {
    console.error('Error obteniendo expediente:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Cambiar estado (solo coordinador)
async function cambiarEstado(req, res) {
  const { id } = req.params;
  const { nuevo_estado, justificacion } = req.body;
  const id_usuario = req.user.id_usuario;

  try {
    const pool = await getPool();
    await pool
      .request()
      .input('id_expediente', sql.Int, id)
      .input('nuevo_estado', sql.NVarChar(20), nuevo_estado)
      .input('justificacion_rechazo', sql.NVarChar(sql.MAX), justificacion || null)
      .input('id_usuario_accion', sql.Int, id_usuario)
      .execute('sp_expediente_cambiar_estado');

    return res.json({ message: 'Estado actualizado correctamente' });

  } catch (err) {
    console.error('Error cambiando estado:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = {
  crearExpediente,
  listarExpedientes,
  obtenerExpediente,
  cambiarEstado
};
