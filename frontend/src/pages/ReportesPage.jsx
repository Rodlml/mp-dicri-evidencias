import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
];

function ReportesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState('');

  const [resumen, setResumen] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chartData =
  resumen?.detalle_por_estado?.map((row) => ({
    estado: row.estado,
    cantidad: row.cantidad,
  })) || [];

    const COLORS = {
    pendiente: '#b68c1fff', // amarillo
    aprobado: '#1b6a38ff',  // verde
    rechazado: '#7b2b2bff', // rojo
  };


  // Solo coordinador puede ver esta página (además del backend)
  if (user && user.rol !== 'coordinador') {
    return <Navigate to="/expedientes" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const cargarReportes = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      if (estado) params.estado = estado;

      const [resumenRes, detalleRes] = await Promise.all([
        api.get('/reportes/expedientes-resumen', { params }),
        api.get('/reportes/expedientes-detalle', { params }),
      ]);

      setResumen(resumenRes.data);
      setDetalle(detalleRes.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Ocurrió un error al cargar los reportes.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cargar al entrar sin filtros (todo el histórico)
  useEffect(() => {
    cargarReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold">MP DICRI - Reportes</h1>
          <button
            onClick={() => navigate('/expedientes')}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
          >
            ← Volver a expedientes
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">
            {user ? `Hola, ${user.nombre} (${user.rol})` : ''}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <section className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">
            Filtros de búsqueda
          </h2>
          <form
            onSubmit={cargarReportes}
            className="grid md:grid-cols-4 gap-4 text-sm"
          >
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
              >
                {ESTADOS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-60"
              >
                {loading ? 'Cargando...' : 'Aplicar filtros'}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Resumen */}
        <section className="grid md:grid-cols-3 gap-4">
          {/* Tarjeta total */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Total de expedientes
            </h3>
            <p className="text-3xl font-bold text-slate-900">
              {resumen?.total_registros ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Registros dentro del rango de fechas y estado seleccionados.
            </p>
          </div>

          {/* Detalle + gráficas */}
          <div className="bg-white shadow rounded-lg p-4 md:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Detalle por estado
              </h3>
              {chartData.length ? (
                <div className="flex flex-wrap gap-3">
                  {chartData.map((row) => (
                    <div
                      key={row.estado}
                      className="border rounded-lg px-3 py-2 text-sm bg-slate-50"
                    >
                      <div className="font-semibold capitalize">
                        {row.estado}
                      </div>
                      <div className="text-slate-700">
                        {row.cantidad} expediente(s)
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No hay datos para los filtros seleccionados.
                </p>
              )}
            </div>

            {chartData.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Gráfica de barras */}
                <div className="h-64">
                  <h4 className="text-xs font-semibold text-slate-600 mb-1">
                    Distribución por estado
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="estado" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="cantidad"
                        name="Expedientes"
                        // fill="#3b82f6"
                      >
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.estado}
                            fill={COLORS[entry.estado] || '#3b82f6'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfica de pastel */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="cantidad"
                        nameKey="estado"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={(entry) =>
                          `${entry.estado} (${entry.cantidad})`
                        }
                      >
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.estado}
                            fill={COLORS[entry.estado] || '#3b82f6'}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </section>


        {/* Detalle en tabla */}
        <section className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Detalle de expedientes</h3>
            <p className="text-xs text-slate-500">
              Resultados: {detalle?.length ?? 0}
            </p>
          </div>
          {loading ? (
            <div className="p-4 text-sm text-slate-500">
              Cargando expedientes...
            </div>
          ) : !detalle || detalle.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">
              No hay expedientes que coincidan con los filtros.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Número
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Fecha registro
                  </th>
                </tr>
              </thead>
              <tbody>
                {detalle.map((exp) => (
                  <tr
                    key={exp.id_expediente}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-2">{exp.id_expediente}</td>
                    <td className="px-4 py-2">
                      {exp.numero_expediente}
                    </td>
                    <td className="px-4 py-2 capitalize">{exp.estado}</td>
                    <td className="px-4 py-2">
                      {exp.fecha_registro
                        ? new Date(exp.fecha_registro).toLocaleString()
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default ReportesPage;
