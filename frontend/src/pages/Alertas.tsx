import { useEffect, useState } from 'react';
import { alertaService } from '../services/api';
import type { Alerta, EstadoAlerta } from '../types';

const ESTADOS: EstadoAlerta[] = ['PENDIENTE', 'EN_REVISION', 'CONFIRMADA', 'DESCARTADA'];

export default function Alertas() {
  const [lista, setLista] = useState<Alerta[]>([]);
  const [soloPendientes, setSoloPendientes] = useState(false);

  const cargar = async () => setLista(await alertaService.listar(soloPendientes));
  useEffect(() => { cargar(); }, [soloPendientes]);

  const cambiar = async (id: number, estado: EstadoAlerta) => {
    await alertaService.cambiarEstado(id, estado);
    await cargar();
  };

  return (
    <>
      <h2>⚠️ Alertas</h2>

      <div className="toolbar">
        <button className={soloPendientes ? 'secundario' : ''} onClick={() => setSoloPendientes(false)}>Todas</button>
        <button className={soloPendientes ? '' : 'secundario'} onClick={() => setSoloPendientes(true)}>Solo pendientes</button>
      </div>

      {lista.length === 0 && <p style={{ color: 'var(--texto-suave)' }}>No hay alertas.</p>}

      {lista.map(a => (
        <div key={a.id} className={`alerta ${a.nivelRiesgo.toLowerCase()}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div className="alerta-titulo">
                <span className="badge robado" style={{ marginRight: '0.5rem' }}>{a.tipo}</span>
                {a.titulo}
              </div>
              <div className="alerta-desc">{a.descripcion}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', marginTop: '0.3rem' }}>
                Riesgo: <strong>{a.nivelRiesgo}</strong> | Estado: <strong>{a.estado}</strong> | {new Date(a.creadaEn).toLocaleString()}
              </div>
            </div>
            <div>
              <select
                value={a.estado}
                onChange={e => cambiar(a.id, e.target.value as EstadoAlerta)}
                style={{ width: 150, fontSize: '0.85rem' }}
              >
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
