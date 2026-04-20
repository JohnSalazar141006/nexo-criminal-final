import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Personas from './pages/Personas';
import Vehiculos from './pages/Vehiculos';
import Ubicaciones from './pages/Ubicaciones';
import Sucesos from './pages/Sucesos';
import Alertas from './pages/Alertas';
import Grafo from './pages/Grafo';
import Sidebar from './components/Sidebar';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function ProtectedRoutes() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/personas" element={<Personas />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/ubicaciones" element={<Ubicaciones />} />
        <Route path="/sucesos" element={<Sucesos />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/grafo" element={<Grafo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
