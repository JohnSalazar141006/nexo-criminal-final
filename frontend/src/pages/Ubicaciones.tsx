import { useEffect, useState } from 'react';
import { ubicacionService } from '../services/api';
import type { Ubicacion, TipoUbicacion } from '../types';

const TIPOS: TipoUbicacion[] = ['TALLER', 'GALPON', 'TERRENO_BALDIO', 'DOMICILIO', 'CAJERO', 'TRANSPORTE_PUBLICO', 'COMERCIO', 'OTRO'];

export default function Ubicaciones() {
  const [lista, setLista] = useState<Ubicacion[]>([]);
  const [form, setForm] = useState<Ubicacion>({ direccion: '', latitud: 0, longitud: 0, tipo: 'OTRO' });
  const [err, setErr] = useState('');

  const cargar = async () => setLista(await ubicacionService.listar());
  useEffect(() => { cargar(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await ubicacionService.crear(form);
      setForm({ direccion: '', latitud: 0, longitud: 0, tipo: 'OTRO' });
      await cargar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Error al guardar');
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar ubicación?')) return;
    await ubicacionService.eliminar(id);
    await cargar();
  };

  return (
    <>
      <h2>📍 Ubicaciones</h2>

      <div className="card">
        <div className="card-title">Registrar ubicación</div>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Dirección</label>
              <input value={form.direccion || ''} onChange={e => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Latitud</label>
              <input type="number" step="0.00001" value={form.latitud} onChange={e => setForm({ ...form, latitud: Number(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Longitud</label>
              <input type="number" step="0.00001" value={form.longitud} onChange={e => setForm({ ...form, longitud: Number(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoUbicacion })}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {err && <div className="error">{err}</div>}
          <button type="submit">Crear</button>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dirección</th>
            <th>Lat/Lng</th>
            <th>Tipo</th>
            <th>Sospechoso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.direccion || '—'}</td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {u.latitud.toFixed(4)}, {u.longitud.toFixed(4)}
              </td>
              <td><span className="badge normal">{u.tipo}</span></td>
              <td>{u.nodoSospechoso ? <span className="badge robado">⚠️ SÍ</span> : '—'}</td>
              <td>
                <button className="secundario" onClick={() => eliminar(u.id!)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>🗑</button>
              </td>
            </tr>
          ))}
          {lista.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--texto-suave)' }}>Sin ubicaciones</td></tr>}
        </tbody>
      </table>
    </>
  );
}
