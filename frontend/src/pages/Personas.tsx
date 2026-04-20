import { useEffect, useState } from 'react';
import { personaService } from '../services/api';
import type { Persona, RolPersona } from '../types';

const ROLES: RolPersona[] = ['VICTIMA', 'SOSPECHOSO', 'TESTIGO', 'PROPIETARIO', 'INTERMEDIARIO'];

export default function Personas() {
  const [lista, setLista] = useState<Persona[]>([]);
  const [form, setForm] = useState<Persona>({
    documento: '', nombre: '', apellido: '', rol: 'VICTIMA'
  });
  const [err, setErr] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargar = async () => setLista(await personaService.listar());
  useEffect(() => { cargar(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      if (editandoId) {
        await personaService.actualizar(editandoId, form);
      } else {
        await personaService.crear(form);
      }
      setForm({ documento: '', nombre: '', apellido: '', rol: 'VICTIMA' });
      setEditandoId(null);
      await cargar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Error al guardar');
    }
  };

  const editar = (p: Persona) => {
    setEditandoId(p.id!);
    setForm(p);
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar persona?')) return;
    await personaService.eliminar(id);
    await cargar();
  };

  return (
    <>
      <h2>👤 Personas</h2>

      <div className="card">
        <div className="card-title">{editandoId ? 'Editar persona' : 'Registrar nueva persona'}</div>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label>Documento</label>
              <input value={form.documento} onChange={e => setForm({ ...form, documento: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Alias</label>
              <input value={form.alias || ''} onChange={e => setForm({ ...form, alias: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value as RolPersona })}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {err && <div className="error">{err}</div>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit">{editandoId ? 'Actualizar' : 'Crear'}</button>
            {editandoId && (
              <button type="button" className="secundario" onClick={() => {
                setEditandoId(null);
                setForm({ documento: '', nombre: '', apellido: '', rol: 'VICTIMA' });
              }}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <table>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Nombre</th>
            <th>Alias</th>
            <th>Rol</th>
            <th>Teléfono</th>
            <th style={{ width: 160 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.map(p => (
            <tr key={p.id}>
              <td>{p.documento}</td>
              <td>{p.nombre} {p.apellido}</td>
              <td>{p.alias || '—'}</td>
              <td>{p.rol}</td>
              <td>{p.telefono || '—'}</td>
              <td>
                <button onClick={() => editar(p)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', marginRight: '0.3rem' }}>Editar</button>
                <button className="secundario" onClick={() => eliminar(p.id!)} style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Borrar</button>
              </td>
            </tr>
          ))}
          {lista.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--texto-suave)' }}>Sin personas registradas</td></tr>}
        </tbody>
      </table>
    </>
  );
}
