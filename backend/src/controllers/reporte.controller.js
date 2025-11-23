const { getPool, sql } = require('../config/db');

async function resumenExpedientes(req, res) {
  const { fecha_inicio, fecha_fin } = req.query;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('fecha_inicio', sql.DateTime, fecha_inicio || null)
      .input('fecha_fin', sql.DateTime, fecha_fin || null)
      .execute('sp_reporte_expedientes_resumen');

    const detalle = result.recordset || [];
    const total_registros = detalle.reduce((acc, row) => acc + (row.cantidad || 0), 0);

    return res.json({
      total_registros,
      detalle_por_estado: detalle
    });
  } catch (err) {
    console.error('Error en resumenExpedientes:', err);
    return res.status(500).json({ message: 'Error generando reporte' });
  }
}

async function detalleExpedientes(req, res) {
  const { fecha_inicio, fecha_fin, estado } = req.query;

  // Validamos estado si viene
  const estadosValidos = ['pendiente', 'aprobado', 'rechazado'];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      message: `Estado inválido. Use uno de: ${estadosValidos.join(', ')}`
    });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('fecha_inicio', sql.DateTime, fecha_inicio || null)
      .input('fecha_fin', sql.DateTime, fecha_fin || null)
      .input('estado', sql.NVarChar(20), estado || null)
      .execute('sp_reporte_expedientes_detalle');

    return res.json(result.recordset || []);
  } catch (err) {
    console.error('Error en detalleExpedientes:', err);
    return res.status(500).json({ message: 'Error generando reporte' });
  }
}

module.exports = {
  resumenExpedientes,
  detalleExpedientes
};
