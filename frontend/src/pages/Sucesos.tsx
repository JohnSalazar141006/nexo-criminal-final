import { useEffect, useState } from 'react';
import { sucesoService, vehiculoService, ubicacionService, personaService } from '../services/api';
import type { Suceso, Vehiculo, Ubicacion, Persona, TipoSuceso } from '../types';

const TIPOS: TipoSuceso[] = ['ROBO_VEHICULO', 'DESAPARICION', 'AVISTAMIENTO', 'TRANSACCION'];

export default function Sucesos() {
  const [lista, setLista] = useState<Suceso[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [form, setForm] = useState<Suceso>({
    tipo: 'ROBO_VEHICULO',
    fechaHora: new Date().toISOString().slice(0, 16),
  });
  const [err, setErr] = useState('');

  const cargar = async () => {
    setLista(await sucesoService.listar());
    setVehiculos(await vehiculoService.listar());
    setUbicaciones(await ubicacionService.listar());
    setPersonas(await personaService.listar());
  };

  useEffect(() => { cargar(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await sucesoService.crear(form);
      setForm({ tipo: 'ROBO_VEHICULO', fechaHora: new Date().toISOString().slice(0, 16) });
      await cargar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Error al guardar');
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar suceso?')) return;
    await sucesoService.eliminar(id);
    await cargar();
  };

  return (
    <>
      <h2>📋 Sucesos</h2>

      <div className="card">
        <div className="card-title">Registrar suceso</div>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label>Tipo</label>
              <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoSuceso })}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Fecha y hora</label>
              <input type="datetime-local" value={form.fechaHora} onChange={e => setForm({ ...form, fechaHora: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Modus operandi</label>
              <input value={form.modusOperandi || ''} onChange={e => setForm({ ...form, modusOperandi: e.target.value })} placeholder="Ej: INHIBIDOR_SENAL" />
            </div>
            <div className="form-group">
              <label>Vehículo</label>
              <select value={form.vehiculo?.id || ''} onChange={e => {
                const id = Number(e.target.value);
                setForm({ ...form, vehiculo: vehiculos.find(v => v.id === id) || null });
              }}>
                <option value="">— ninguno —</option>
                {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} ({v.marca} {v.modelo})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Víctima</label>
              <select value={form.victima?.id || ''} onChange={e => {
                const id = Number(e.target.value);
                setForm({ ...form, victima: personas.find(p => p.id === id) || null });
              }}>
                <option value="">— ninguna —</option>
                {personas.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ubicación del hecho</label>
              <select value={form.ubicacion?.id || ''} onChange={e => {
                const id = Number(e.target.value);
                setForm({ ...form, ubicacion: ubicaciones.find(u => u.id === id) || null });
              }}>
                <option value="">— ninguna —</option>
                {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.direccion || `Ubi #${u.id}`} ({u.tipo})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Última ubicación conocida</label>
              <select value={form.ubicacionUltima?.id || ''} onChange={e => {
                const id = Number(e.target.value);
                setForm({ ...form, ubicacionUltima: ubicaciones.find(u => u.id === id) || null });
              }}>
                <option value="">— ninguna —</option>
                {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.direccion || `Ubi #${u.id}`} ({u.tipo})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Descripción</label>
              <textarea rows={2} value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
          {err && <div className="error">{err}</div>}
          <button type="submit">Crear suceso</button>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Vehículo</th>
            <th>Víctima</th>
            <th>Modus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td><span className="badge robado">{s.tipo}</span></td>
              <td style={{ fontSize: '0.85rem' }}>{new Date(s.fechaHora).toLocaleString()}</td>
              <td>{s.vehiculo?.placa || '—'}</td>
              <td>{s.victima ? `${s.victima.nombre} ${s.victima.apellido}` : '—'}</td>
              <td>{s.modusOperandi || '—'}</td>
              <td>
                <button className="secundario" onClick={() => eliminar(s.id!)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>🗑</button>
              </td>
            </tr>
          ))}
          {lista.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-suave)' }}>Sin sucesos</td></tr>}
        </tbody>
      </table>
    </>
  );
}
