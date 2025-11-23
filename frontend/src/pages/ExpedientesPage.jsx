import { useEffect, useState } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';

const ESTADOS = ['pendiente', 'aprobado', 'rechazado'];

function ExpedientesPage() {
  const { user, logout } = useAuthStore();
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEstadoId, setLoadingEstadoId] = useState(null);
  const [error, setError] = useState('');
  const [numeroNuevo, setNumeroNuevo] = useState('');
  const [creando, setCreando] = useState(false);

  const esCoordinador = user?.rol === 'coordinador';

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const cargarExpedientes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/expedientes');
      setExpedientes(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los expedientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarExpedientes();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!numeroNuevo.trim()) return;

    setCreando(true);
    setError('');
    try {
      await api.post('/expedientes', {
        numero_expediente: numeroNuevo.trim(),
      });
      setNumeroNuevo('');
      await cargarExpedientes();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Error al crear el expediente.'
      );
    } finally {
      setCreando(false);
    }
  };

  const handleCambiarEstado = async (id_expediente, nuevo_estado) => {
    if (!esCoordinador) {
      setError('Solo un coordinador puede cambiar el estado del expediente.');
      return;
    }

    setLoadingEstadoId(id_expediente);
    setError('');

    try {
      await api.put(`/expedientes/${id_expediente}/estado`, {
        nuevo_estado,
        justificacion: nuevo_estado === 'rechazado'
          ? 'Rechazado desde la interfaz web'
          : null,
      });
      await cargarExpedientes();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'No se pudo actualizar el estado.'
      );
    } finally {
      setLoadingEstadoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">
        <h1 className="font-semibold">MP DICRI - Expedientes</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {user ? `Hola, ${user.nombre} (${user.rol})` : ''}
          </span>

          {esCoordinador && (
            <Link
              to="/reportes"
              className="text-sm bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded"
            >
              Ver reportes
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <section className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Listado de expedientes</h2>
            <p className="text-slate-600 text-sm">
              Puedes crear nuevos expedientes y, si eres coordinador, actualizar su estado.
            </p>
          </div>

          <form
            onSubmit={handleCrear}
            className="bg-white shadow rounded-lg px-4 py-3 flex flex-col md:flex-row gap-2 md:items-center"
          >
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Número de expediente
              </label>
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm w-full md:w-64 focus:outline-none focus:ring focus:ring-blue-200"
                value={numeroNuevo}
                onChange={(e) => setNumeroNuevo(e.target.value)}
                placeholder="MP-DICRI-0001-2025"
                required
              />
            </div>
            <button
              type="submit"
              disabled={creando}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded mt-2 md:mt-0 disabled:opacity-60"
            >
              {creando ? 'Creando...' : 'Crear expediente'}
            </button>
          </form>
        </section>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <section className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              Cargando expedientes...
            </div>
          ) : expedientes.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No hay expedientes registrados.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Número
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Fecha registro
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {expedientes.map((exp) => (
                  <tr key={exp.id_expediente} className="border-b last:border-0">
                    <td className="px-4 py-2">{exp.id_expediente}</td>
                    <td className="px-4 py-2">{exp.numero_expediente}</td>
                    <td className="px-4 py-2 capitalize">{exp.estado}</td>
                    <td className="px-4 py-2">
                      {exp.fecha_registro
                        ? new Date(exp.fecha_registro).toLocaleString()
                        : ''}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        {ESTADOS.map((estado) => (
                          <button
                            key={estado}
                            disabled={loadingEstadoId === exp.id_expediente}
                            onClick={() =>
                              handleCambiarEstado(exp.id_expediente, estado)
                            }
                            className={`text-xs px-2 py-1 rounded border ${
                              exp.estado === estado
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white hover:bg-slate-100 border-slate-300'
                            } disabled:opacity-50`}
                          >
                            {estado}
                          </button>
                        ))}

                        <Link
                          to={`/expedientes/${exp.id_expediente}`}
                          className="text-xs px-2 py-1 rounded border bg-white hover:bg-slate-100 border-slate-300"
                        >
                          Ver detalle
                        </Link>
                        
                      </div>
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

export default ExpedientesPage;
