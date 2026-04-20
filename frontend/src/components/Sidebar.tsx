import { NavLink } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const link = ({ isActive }: { isActive: boolean }) => (isActive ? 'activo' : '');

  return (
    <aside className="sidebar">
      <h1>🧵 Nexo Criminal</h1>
      <nav>
        <NavLink to="/" end className={link}>🏠 Dashboard</NavLink>
        <NavLink to="/personas" className={link}>👤 Personas</NavLink>
        <NavLink to="/vehiculos" className={link}>🚗 Vehículos</NavLink>
        <NavLink to="/ubicaciones" className={link}>📍 Ubicaciones</NavLink>
        <NavLink to="/sucesos" className={link}>📋 Sucesos</NavLink>
        <NavLink to="/alertas" className={link}>⚠️ Alertas</NavLink>
        <NavLink to="/grafo" className={link}>🧵 Grafo (Red Thread)</NavLink>
      </nav>

      <div className="user-info">
        <div className="username">{user?.nombreCompleto || user?.username}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)' }}>{user?.rol}</div>
        <button
          className="secundario"
          style={{ marginTop: '0.6rem', width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
