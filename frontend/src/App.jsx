import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ExpedientesPage from './pages/ExpedientesPage';
import ExpedienteDetallePage from './pages/ExpedienteDetallePage';
import ReportesPage from './pages/ReportesPage';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';

function App() {
  const { token } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? <Navigate to="/expedientes" replace /> : <Navigate to="/login" replace />
        }
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/expedientes"
        element={
          <ProtectedRoute>
            <ExpedientesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expedientes/:id"
        element={
          <ProtectedRoute>
            <ExpedienteDetallePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <ProtectedRoute>
            <ReportesPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
