import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setCargando(true);
    try {
      const sesion = await authService.login(username, password);
      login(sesion);
      nav('/');
    } catch {
      setErr('Credenciales inválidas. Prueba con admin / admin123.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={onSubmit}>
        <h1>🧵 Nexo Criminal</h1>
        <p>Sistema de Inteligencia de Vínculos — The Red Thread</p>

        <div className="form-group">
          <label>Usuario</label>
          <input value={username} onChange={e => setUsername(e.target.value)} autoFocus />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {err && <div className="error">{err}</div>}

        <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }} disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
          Usuario por defecto: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </form>
    </div>
  );
}
