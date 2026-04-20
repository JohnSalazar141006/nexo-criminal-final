import { useEffect, useState } from 'react';
import { personaService, vehiculoService } from '../services/api';
import type { Persona, Vehiculo, EstadoVehiculo } from '../types';

const ESTADOS: EstadoVehiculo[] = ['NORMAL', 'ROBADO', 'RECUPERADO', 'DESAPARECIDO', 'BAJO_OBSERVACION', 'VEHICULO_APOYO'];

export default function Vehiculos() {
  const [lista, setLista] = useState<Vehiculo[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [form, setForm] = useState<Vehiculo>({
    placa: '', marca: '', modelo: '', estado: 'NORMAL'
  });
  const [err, setErr] = useState('');

  const cargar = async () => {
    setLista(await vehiculoService.listar());
    setPersonas(await personaService.listar());
  };

  useEffect(() => { cargar(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      await vehiculoService.crear(form);
      setForm({ placa: '', marca: '', modelo: '', estado: 'NORMAL' });
      await cargar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Error al guardar');
    }
  };

  const cambiarEstado = async (id: number, estado: EstadoVehiculo) => {
    await vehiculoService.cambiarEstado(id, estado);
    await cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar vehículo?')) return;
    await vehiculoService.eliminar(id);
    await cargar();
  };

  const badgeClase = (e?: EstadoVehiculo) => {
    if (e === 'ROBADO' || e === 'DESAPARECIDO') return 'robado';
    if (e === 'VEHICULO_APOYO' || e === 'BAJO_OBSERVACION') return 'apoyo';
    return 'normal';
  };

  return (
    <>
      <h2>🚗 Vehículos</h2>

      <div className="card">
        <div className="card-title">Registrar nuevo vehículo</div>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label>Placa</label>
              <input value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })} required />
            </div>
            <div className="form-group">
              <label>Marca</label>
              <input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Modelo</label>
              <input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Año</label>
              <input type="number" value={form.anio || ''} onChange={e => setForm({ ...form, anio: Number(e.target.value) || undefined })} />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input value={form.color || ''} onChange={e => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Propietario</label>
              <select
                value={form.propietario?.id || ''}
                onChange={e => {
                  const id = Number(e.target.value);
                  const pers = personas.find(p => p.id === id) || null;
                  setForm({ ...form, propietario: pers });
                }}
              >
                <option value="">— ninguno —</option>
                {personas.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido} ({p.documento})</option>
                ))}
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
            <th>Placa</th>
            <th>Marca / Modelo</th>
            <th>Año</th>
            <th>Color</th>
            <th>Estado</th>
            <th>Propietario</th>
            <th style={{ width: 220 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.map(v => (
            <tr key={v.id}>
              <td><strong>{v.placa}</strong></td>
              <td>{v.marca} {v.modelo}</td>
              <td>{v.anio || '—'}</td>
              <td>{v.color || '—'}</td>
              <td><span className={`badge ${badgeClase(v.estado)}`}>{v.estado}</span></td>
              <td>{v.propietario ? `${v.propietario.nombre} ${v.propietario.apellido}` : '—'}</td>
              <td>
                <select
                  value={v.estado}
                  onChange={e => cambiarEstado(v.id!, e.target.value as EstadoVehiculo)}
                  style={{ width: 140, fontSize: '0.8rem', padding: '0.3rem' }}
                >
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <button className="secundario" onClick={() => eliminar(v.id!)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.3rem' }}>🗑</button>
              </td>
            </tr>
          ))}
          {lista.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-suave)' }}>Sin vehículos registrados</td></tr>}
        </tbody>
      </table>
    </>
  );
}
