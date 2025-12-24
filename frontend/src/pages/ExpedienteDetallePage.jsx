import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function ExpedienteDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();  
  
  const esCoordinador = user?.rol === 'coordinador';

  const [expediente, setExpediente] = useState(null);
  const [indicios, setIndicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIndicios, setLoadingIndicios] = useState(false);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');

  const [formIndicio, setFormIndicio] = useState({
    descripcion: '',
    color: '',
    tamano: '',
    peso: '',
    ubicacion: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const cargarExpediente = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/expedientes/${id}`);
      setExpediente(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la información del expediente.');
    } finally {
      setLoading(false);
    }
  };

  const cargarIndicios = async () => {
    setLoadingIndicios(true);
    setError('');
    try {
      const res = await api.get(`/expedientes/${id}/indicios`);
      setIndicios(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los indicios.');
    } finally {
      setLoadingIndicios(false);
    }
  };

  useEffect(() => {
    cargarExpediente();
    cargarIndicios();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormIndicio((prev) => ({ ...prev, [name]: value }));
  };

  const handleCrearIndicio = async (e) => {
    e.preventDefault();
    if (!formIndicio.descripcion.trim()) return;

    setCreando(true);
    setError('');
    try {
      await api.post(`/expedientes/${id}/indicios`, {
        ...formIndicio,
        descripcion: formIndicio.descripcion.trim(),
      });

      // limpiar formulario
      setFormIndicio({
        descripcion: '',
        color: '',
        tamano: '',
        peso: '',
        ubicacion: '',
      });

      await cargarIndicios();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'No se pudo registrar el indicio.'
      );
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold">MP DICRI - Expediente</h1>
          <Link
            to="/expedientes"
            className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
          >
            ← Volver al listado
          </Link>
        </div>

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

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Información del expediente */}
        <section className="bg-white shadow rounded-lg p-4">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando expediente...</p>
          ) : !expediente ? (
            <p className="text-sm text-red-600">
              No se encontró el expediente solicitado.
            </p>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Expediente #{expediente.id_expediente}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <span className="font-semibold">Número: </span>
                    {expediente.numero_expediente}
                  </p>
                  <p>
                    <span className="font-semibold">Estado: </span>
                    <span className="capitalize">{expediente.estado}</span>
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Fecha registro: </span>
                    {expediente.fecha_registro
                      ? new Date(expediente.fecha_registro).toLocaleString()
                      : ''}
                  </p>
                  {/* Aquí podrías mostrar info de quién lo registró, etc, si el SP lo devuelve */}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Formulario de nuevo indicio */}
        <section className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Registrar nuevo indicio</h3>
          <form
            onSubmit={handleCrearIndicio}
            className="grid md:grid-cols-2 gap-4 text-sm"
          >
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formIndicio.descripcion}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 min-h-[60px] focus:outline-none focus:ring focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formIndicio.color}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Tamaño
              </label>
              <input
                type="text"
                name="tamano"
                value={formIndicio.tamano}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Peso
              </label>
              <input
                type="text"
                name="peso"
                value={formIndicio.peso}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formIndicio.ubicacion}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={creando}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-60"
              >
                {creando ? 'Guardando...' : 'Agregar indicio'}
              </button>
            </div>
          </form>
        </section>

        {/* Tabla de indicios */}
        <section className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="text-lg font-semibold">Indicios registrados</h3>
          </div>
          {loadingIndicios ? (
            <div className="p-4 text-sm text-slate-500">
              Cargando indicios...
            </div>
          ) : indicios.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">
              No hay indicios registrados para este expediente.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">ID</th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Descripción
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Características
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Fecha registro
                  </th>
                </tr>
              </thead>
              <tbody>
                {indicios.map((ind) => (
                  <tr key={ind.id_indicio} className="border-b last:border-0">
                    <td className="px-4 py-2">{ind.id_indicio}</td>
                    <td className="px-4 py-2">{ind.descripcion}</td>
                    <td className="px-4 py-2">
                      <div className="space-y-1">
                        {ind.color && (
                          <div>
                            <span className="font-semibold">Color: </span>
                            {ind.color}
                          </div>
                        )}
                        {ind.tamano && (
                          <div>
                            <span className="font-semibold">Tamaño: </span>
                            {ind.tamano}
                          </div>
                        )}
                        {ind.peso && (
                          <div>
                            <span className="font-semibold">Peso: </span>
                            {ind.peso}
                          </div>
                        )}
                        {ind.ubicacion && (
                          <div>
                            <span className="font-semibold">Ubicación: </span>
                            {ind.ubicacion}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {ind.fecha_registro
                        ? new Date(ind.fecha_registro).toLocaleString()
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

export default ExpedienteDetallePage;
