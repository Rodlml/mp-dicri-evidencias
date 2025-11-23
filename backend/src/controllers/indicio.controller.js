const { getPool, sql } = require('../config/db');

// Crear indicio dentro de un expediente
async function crearIndicio(req, res) {
  const { id_expediente } = req.params;
  const {
    descripcion,
    color,
    tamano,
    peso_libras,
    ubicacion
  } = req.body || {};

  if (!descripcion) {
    return res.status(400).json({ message: 'La descripción es requerida' });
  }

  const id_tecnico = req.user.id_usuario;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', sql.Int, id_expediente)
      .input('descripcion', sql.NVarChar(300), descripcion)
      .input('color', sql.NVarChar(100), color || null)
      .input('tamano', sql.NVarChar(100), tamano || null)
      .input('peso_libras', sql.NVarChar(50), peso_libras || null)
      .input('ubicacion', sql.NVarChar(200), ubicacion || null)
      .execute('sp_indicio_crear');

    const id_indicio = result.recordset[0].id_indicio;

    return res.json({
      message: 'Indicio creado correctamente',
      id_indicio
    });
  } catch (err) {
    console.error('Error creando indicio:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Listar indicios de un expediente
async function listarIndiciosPorExpediente(req, res) {
  const { id_expediente } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_expediente', sql.Int, id_expediente)
      .execute('sp_indicio_listar_por_expediente');

    return res.json(result.recordset);
  } catch (err) {
    console.error('Error listando indicios:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Obtener indicio por id (query directa)
async function obtenerIndicio(req, res) {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_indicio', sql.Int, id)
      .query(`
        SELECT 
          i.id_indicio,
          i.id_expediente,
          i.descripcion,
          i.color,
          i.tamano,
          i.peso_libras,
          i.ubicacion,
          i.fecha_registro
        FROM Indicio i
        WHERE i.id_indicio = @id_indicio
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Indicio no encontrado' });
    }

    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error obteniendo indicio:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Eliminar indicio (solo coordinador)
async function eliminarIndicio(req, res) {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id_indicio', sql.Int, id)
      .query(`
        DELETE FROM Indicio WHERE id_indicio = @id_indicio;
      `);

    // rowCount no siempre viene en mssql, pero si queremos revisar:
    // if (result.rowsAffected[0] === 0) ...

    return res.json({ message: 'Indicio eliminado (si existía)' });
  } catch (err) {
    console.error('Error eliminando indicio:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = {
  crearIndicio,
  listarIndiciosPorExpediente,
  obtenerIndicio,
  eliminarIndicio
};
