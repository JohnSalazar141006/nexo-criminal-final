import { useEffect, useState } from 'react';
import { alertaService, personaService, vehiculoService, sucesoService, engineService } from '../services/api';
import type { Alerta } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState({ personas: 0, vehiculos: 0, robados: 0, sucesos: 0, alertas: 0 });
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [msg, setMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    try {
      const [pers, veh, robs, suc, al] = await Promise.all([
        personaService.listar(),
        vehiculoService.listar(),
        vehiculoService.listar('ROBADO'),
        sucesoService.listar(),
        alertaService.listar(true),
      ]);
      setStats({
        personas: pers.length,
        vehiculos: veh.length,
        robados: robs.length,
        sucesos: suc.length,
        alertas: al.length,
      });
      setAlertas(al.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { cargar(); }, []);

  const ejecutarMotor = async () => {
    setCargando(true);
    setMsg('');
    try {
      const r = await engineService.ejecutarTodo();
      setMsg(`✅ Motor ejecutado: ${r.totalVinculos} vínculos nuevos, ${r.totalAlertas} alertas generadas.`);
      await cargar();
    } catch {
      setMsg('❌ Error al ejecutar el motor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-valor">{stats.personas}</div>
          <div className="stat-label">Personas registradas</div>
        </div>
        <div className="stat-card">
          <div className="stat-valor">{stats.vehiculos}</div>
          <div className="stat-label">Vehículos registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-valor">{stats.robados}</div>
          <div className="stat-label">Vehículos robados</div>
        </div>
        <div className="stat-card">
          <div className="stat-valor">{stats.sucesos}</div>
          <div className="stat-label">Sucesos</div>
        </div>
        <div className="stat-card">
          <div className="stat-valor">{stats.alertas}</div>
          <div className="stat-label">Alertas pendientes</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🧵 Red Thread Engine</div>
        <p style={{ color: 'var(--texto-suave)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
          Ejecuta las reglas de detección de vínculos sobre todos los datos actuales
          (nodo logístico, escolta vehicular, círculo de confianza, modus operandi).
        </p>
        <button onClick={ejecutarMotor} disabled={cargando}>
          {cargando ? 'Ejecutando...' : '▶ Ejecutar motor completo'}
        </button>
        {msg && <div style={{ marginTop: '0.8rem' }} className={msg.startsWith('✅') ? 'success' : 'error'}>{msg}</div>}
      </div>

      <div className="card">
        <div className="card-title">⚠️ Últimas alertas pendientes</div>
        {alertas.length === 0 && <p style={{ color: 'var(--texto-suave)' }}>No hay alertas pendientes.</p>}
        {alertas.map(a => (
          <div key={a.id} className={`alerta ${a.nivelRiesgo.toLowerCase()}`}>
            <div className="alerta-titulo">{a.titulo}</div>
            <div className="alerta-desc">{a.descripcion}</div>
          </div>
        ))}
      </div>
    </>
  );
}
