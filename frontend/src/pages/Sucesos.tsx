import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  sucesoService, vehiculoService, ubicacionService, personaService,
} from '../services/api';
import type { Suceso, Vehiculo, Ubicacion, Persona, TipoSuceso } from '../types';
import { usePaginacion } from '../services/usePaginacion';
import Paginacion from '../components/Paginacion';
import MapaTactical, { PuntoMapa } from '../components/MapaTactical';
import ModalDetalle from '../components/ModalDetalle';
import ModalConfirmar from '../components/ModalConfirmar';
import { exportarCSV } from '../services/exportar';

const TIPOS: TipoSuceso[] = ['ROBO_VEHICULO', 'DESAPARICION', 'AVISTAMIENTO', 'TRANSACCION'];

const tipoLabel: Record<string, string> = {
  ROBO_VEHICULO: 'Robo de vehículo',
  DESAPARICION: 'Desaparición',
  AVISTAMIENTO: 'Avistamiento',
  TRANSACCION: 'Transacción',
};

export default function Sucesos() {
  const [searchParams] = useSearchParams();
  const [lista, setLista] = useState<Suceso[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);

  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroVehiculo, setFiltroVehiculo] = useState<string>('');
  const [filtroPersona, setFiltroPersona] = useState<string>('');
  const [filtroUbicacion, setFiltroUbicacion] = useState<string>('');

  const [form, setForm] = useState<Suceso>({
    tipo: 'ROBO_VEHICULO',
    fechaHora: new Date().toISOString().slice(0, 16),
  });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [detalle, setDetalle] = useState<Suceso | null>(null);
  const [aEliminar, setAEliminar] = useState<Suceso | null>(null);

  const cargar = async () => {
    try {
      const s = await sucesoService.listar();
      setLista(s);
    } catch (e) { console.error('Sucesos:', e); }
    try {
      const v = await vehiculoService.listar();
      setVehiculos(v);
    } catch (e) { console.error('Vehiculos:', e); }
    try {
      const u = await ubicacionService.listar();
      setUbicaciones(u);
    } catch (e) { console.error('Ubicaciones:', e); }
    try {
      const p = await personaService.listar();
      setPersonas(p);
    } catch (e) { console.error('Personas:', e); }
  };

  useEffect(() => {
    cargar();
    // Si viene ?nueva=1 en la URL, scrollear al formulario
    if (searchParams.get('nueva') === '1') {
      setTimeout(() => {
        document.getElementById('form-suceso')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setOk('');
    try {
      const payload = {
        ...form,
        vehiculo: form.vehiculo?.id ? { id: form.vehiculo.id } : null,
        victima: form.victima?.id ? { id: form.victima.id } : null,
        ubicacion: form.ubicacion?.id ? { id: form.ubicacion.id } : null,
        ubicacionUltima: form.ubicacionUltima?.id ? { id: form.ubicacionUltima.id } : null,
      };
      await sucesoService.crear(payload as Suceso);
      setForm({ tipo: 'ROBO_VEHICULO', fechaHora: new Date().toISOString().slice(0, 16) });
      setOk('Suceso registrado correctamente');
      setTimeout(() => setOk(''), 3000);
      await cargar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Error al guardar');
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    try {
      await sucesoService.eliminar(aEliminar.id!);
      setAEliminar(null);
      setOk('Suceso eliminado');
      setTimeout(() => setOk(''), 3000);
      await cargar();
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo eliminar');
      setAEliminar(null);
    }
  };

  const exportar = () => {
    exportarCSV(
      filtrados.map(s => ({
        ID: `EV-${String(s.id).padStart(4, '0')}`,
        Tipo: tipoLabel[s.tipo],
        Fecha: new Date(s.fechaHora).toLocaleString('es-ES'),
        Vehiculo: s.vehiculo?.placa || '',
        Marca: s.vehiculo ? `${s.vehiculo.marca} ${s.vehiculo.modelo}` : '',
        Victima: s.victima ? `${s.victima.nombre} ${s.victima.apellido}` : '',
        Ubicacion: s.ubicacion?.direccion || '',
        Modus: s.modusOperandi || '',
        Descripcion: s.descripcion || '',
      })),
      'sucesos'
    );
  };

  const filtrados = lista.filter(s => {
    if (filtroTipo && s.tipo !== filtroTipo) return false;
    if (filtroVehiculo && String(s.vehiculo?.id) !== filtroVehiculo) return false;
    if (filtroPersona && String(s.victima?.id) !== filtroPersona) return false;
    if (filtroUbicacion && String(s.ubicacion?.id) !== filtroUbicacion) return false;
    if (!filtro.trim()) return true;
    const q = filtro.toLowerCase();
    return s.tipo.toLowerCase().includes(q) ||
      s.modusOperandi?.toLowerCase().includes(q) ||
      s.descripcion?.toLowerCase().includes(q) ||
      s.vehiculo?.placa?.toLowerCase().includes(q) ||
      s.victima?.nombre?.toLowerCase().includes(q) ||
      s.victima?.apellido?.toLowerCase().includes(q);
  });

  const { visibles, pagina, setPagina, total, porPagina } = usePaginacion(filtrados, 10);

  const puntos: PuntoMapa[] = useMemo(
    () => filtrados.filter(s => s.ubicacion?.latitud && s.ubicacion?.longitud)
      .map(s => ({
        id: s.id!, lat: s.ubicacion!.latitud, lng: s.ubicacion!.longitud,
        tipo: 'SUCESO',
        titulo: tipoLabel[s.tipo],
        subtitulo: `EV-${String(s.id).padStart(4, '0')}`,
        sospechoso: s.tipo === 'ROBO_VEHICULO',
        campos: [
          { etiqueta: 'Fecha', valor: new Date(s.fechaHora).toLocaleString('es-ES') },
          { etiqueta: 'Vehículo', valor: s.vehiculo ? s.vehiculo.placa : '—' },
          { etiqueta: 'Víctima', valor: s.victima ? `${s.victima.nombre} ${s.victima.apellido}` : '—' },
          { etiqueta: 'Modus', valor: s.modusOperandi || '—' },
        ],
      })), [filtrados]);

  const ultimaSemana = lista.filter(s => {
    const d = new Date(s.fechaHora);
    return d.getTime() > Date.now() - 7 * 24 * 3600 * 1000;
  }).length;

  const robos = lista.filter(s => s.tipo === 'ROBO_VEHICULO').length;
  const desapariciones = lista.filter(s => s.tipo === 'DESAPARICION').length;

  const limpiarFiltros = () => {
    setFiltro(''); setFiltroTipo(''); setFiltroVehiculo('');
    setFiltroPersona(''); setFiltroUbicacion('');
  };

  const filtrosActivos = filtro || filtroTipo || filtroVehiculo || filtroPersona || filtroUbicacion;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de Sucesos</h1>
          <p className="page-subtitle">Gestión y monitoreo de incidentes criminales en tiempo real.</p>
        </div>
        <div className="page-badges">
          <span className="badge-pill">TOTAL: {lista.length}</span>
          <span className="badge-pill alerta">ÚLTIMA SEMANA: {ultimaSemana}</span>
        </div>
      </div>

      <div className="toolbar">
        <button className="btn-ghost" onClick={exportar}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
          Exportar CSV
        </button>
      </div>

      <div className="bento-grid" id="form-suceso">
        <div className="bento-col-5">
          <div className="form-card" style={{ height: '100%' }}>
            <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 20 }}>
              <span className="material-symbols-outlined">app_registration</span>
              <h3 className="card-title">Registrar suceso</h3>
            </div>

            <form onSubmit={submit}>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoSuceso })}>
                    {TIPOS.map(t => <option key={t} value={t}>{tipoLabel[t]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha y hora</label>
                  <input type="datetime-local" value={form.fechaHora}
                    onChange={(e) => setForm({ ...form, fechaHora: e.target.value })} required />
                </div>
                <div className="form-group full">
                  <label className="form-label">Modus operandi</label>
                  <input value={form.modusOperandi || ''}
                    onChange={(e) => setForm({ ...form, modusOperandi: e.target.value })}
                    placeholder="Ej: INHIBIDOR_SENAL, GRUA_FALSA..." />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Vehículo<span className="entity-counter">{vehiculos.length}</span>
                  </label>
                  <select value={form.vehiculo?.id || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setForm({ ...form, vehiculo: vehiculos.find(v => v.id === id) || null });
                    }}>
                    <option value="">— Ninguno —</option>
                    {vehiculos.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.placa} — {v.marca} {v.modelo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Víctima<span className="entity-counter">{personas.length}</span>
                  </label>
                  <select value={form.victima?.id || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setForm({ ...form, victima: personas.find(p => p.id === id) || null });
                    }}>
                    <option value="">— Ninguna —</option>
                    {personas.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} {p.apellido} ({p.rol})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Ubicación del hecho<span className="entity-counter">{ubicaciones.length}</span>
                  </label>
                  <select value={form.ubicacion?.id || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setForm({ ...form, ubicacion: ubicaciones.find(u => u.id === id) || null });
                    }}>
                    <option value="">— Ninguna —</option>
                    {ubicaciones.map(u => (
                      <option key={u.id} value={u.id}>{u.direccion || `Ubi #${u.id}`}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Última ubicación</label>
                  <select value={form.ubicacionUltima?.id || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setForm({ ...form, ubicacionUltima: ubicaciones.find(u => u.id === id) || null });
                    }}>
                    <option value="">— Ninguna —</option>
                    {ubicaciones.map(u => (
                      <option key={u.id} value={u.id}>{u.direccion || `Ubi #${u.id}`}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">Descripción</label>
                  <textarea rows={3} value={form.descripcion || ''}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Detalles adicionales del incidente..." />
                </div>
              </div>
              {err && <div className="error">{err}</div>}
              {ok && <div className="success">{ok}</div>}
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 16 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                Crear suceso
              </button>
            </form>
          </div>
        </div>

        <div className="bento-col-7">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
            <MapaTactical puntos={puntos} altura={300}
              hudLabel="Mapa de sucesos"
              hudValor={`${puntos.length} de ${lista.length} con ubicación`}
              emptyMessage="Sin sucesos georreferenciados" />

            <div className="mini-stats">
              <div className="mini-stat" style={{ borderLeft: '4px solid var(--red-500)' }}>
                <div className="mini-stat-label">Sucesos totales</div>
                <div className="mini-stat-value">{lista.length}</div>
                <div className="mini-stat-change">+{ultimaSemana} última semana</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-label">Robos de vehículo</div>
                <div className="mini-stat-value danger">{robos}</div>
                <div className="mini-stat-change danger">Activos</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-label">Desapariciones</div>
                <div className="mini-stat-value tertiary">{desapariciones}</div>
                <div className="mini-stat-change">En investigación</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="form-card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--red-500)', fontSize: 18 }}>filter_alt</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Filtros avanzados
          </span>
          {filtrosActivos && (
            <button type="button" className="btn-ghost"
              style={{ marginLeft: 'auto', fontSize: 10, padding: '4px 10px' }}
              onClick={limpiarFiltros}>
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>clear</span>
              Limpiar filtros
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS.map(t => <option key={t} value={t}>{tipoLabel[t]}</option>)}
          </select>
          <select value={filtroVehiculo} onChange={(e) => setFiltroVehiculo(e.target.value)}>
            <option value="">Cualquier vehículo</option>
            {vehiculos.map(v => (
              <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</option>
            ))}
          </select>
          <select value={filtroPersona} onChange={(e) => setFiltroPersona(e.target.value)}>
            <option value="">Cualquier víctima</option>
            {personas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
            ))}
          </select>
          <select value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)}>
            <option value="">Cualquier ubicación</option>
            {ubicaciones.map(u => (
              <option key={u.id} value={u.id}>{u.direccion || `Ubi #${u.id}`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        <div className="table-header">
          <div className="table-header-title">
            <span className="material-symbols-outlined">format_list_bulleted</span>
            <h3>Historial de Sucesos</h3>
          </div>
          <div className="table-header-actions">
            <div className="filter-input-wrap">
              <span className="material-symbols-outlined">search</span>
              <input type="text" placeholder="Buscar por texto libre..."
                value={filtro} onChange={(e) => setFiltro(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Tipo</th><th>Fecha</th>
                <th>Vehículo</th><th>Víctima</th><th>Modus</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map(s => (
                <tr key={s.id}>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    #EV-{String(s.id).padStart(4, '0')}
                  </td>
                  <td style={{ color: 'white', fontWeight: 600 }}>{tipoLabel[s.tipo]}</td>
                  <td style={{ fontSize: 11, color: 'var(--slate-400)' }}>
                    {new Date(s.fechaHora).toLocaleString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    }).toUpperCase()}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {s.vehiculo ? (
                      <>
                        <span style={{ color: 'white', fontFamily: 'var(--font-mono)' }}>{s.vehiculo.placa}</span>
                        <div className="row-sub">{s.vehiculo.marca} {s.vehiculo.modelo}</div>
                      </>
                    ) : <span style={{ color: 'var(--slate-600)' }}>Sin vehículo</span>}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {s.victima ? `${s.victima.nombre} ${s.victima.apellido}`
                      : <span style={{ color: 'var(--slate-600)' }}>—</span>}
                  </td>
                  <td>
                    {s.modusOperandi ? (
                      <span className="badge robado" style={{ fontFamily: 'var(--font-mono)' }}>{s.modusOperandi}</span>
                    ) : '—'}
                  </td>
                  <td className="right">
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => setDetalle(s)} title="Ver detalle">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
                      </button>
                      <button className="btn-icon danger" onClick={() => setAEliminar(s)} title="Eliminar">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr><td colSpan={7} className="table-empty">
                  {filtrosActivos ? 'Sin resultados' : 'Sin sucesos registrados'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Paginacion total={total} pagina={pagina} porPagina={porPagina}
          onCambiar={setPagina} label="sucesos" />
      </div>

      {/* Modal Detalle */}
      {detalle && (
        <ModalDetalle abierto={!!detalle} onClose={() => setDetalle(null)}
          titulo={tipoLabel[detalle.tipo]}
          subtitulo={`EV-${String(detalle.id).padStart(4, '0')}`}
          icono="event_note"
          campos={[
            { etiqueta: 'ID', valor: `EV-${String(detalle.id).padStart(4, '0')}`, mono: true, destacado: true },
            { etiqueta: 'Tipo', valor: tipoLabel[detalle.tipo] },
            { etiqueta: 'Fecha y hora', valor: new Date(detalle.fechaHora).toLocaleString('es-ES'), mono: true },
            { etiqueta: 'Modus operandi', valor: detalle.modusOperandi || '—', mono: true },
            { etiqueta: 'Vehículo', valor: detalle.vehiculo ? `${detalle.vehiculo.placa} — ${detalle.vehiculo.marca} ${detalle.vehiculo.modelo}` : '—' },
            { etiqueta: 'Víctima', valor: detalle.victima ? `${detalle.victima.nombre} ${detalle.victima.apellido}` : '—' },
            { etiqueta: 'Ubicación del hecho', valor: detalle.ubicacion?.direccion || '—' },
            { etiqueta: 'Última ubicación', valor: detalle.ubicacionUltima?.direccion || '—' },
          ]}
          extra={
            detalle.descripcion ? (
              <div style={{ marginTop: 16 }}>
                <h4 style={{
                  fontSize: 11, color: 'var(--slate-500)', textTransform: 'uppercase',
                  letterSpacing: '0.1em', margin: '0 0 8px',
                }}>
                  Descripción detallada
                </h4>
                <div style={{
                  padding: 12, background: 'var(--slate-950)',
                  border: '1px solid var(--slate-800)', fontSize: 13,
                  color: 'var(--slate-300)', lineHeight: 1.6,
                }}>
                  {detalle.descripcion}
                </div>
              </div>
            ) : null
          }
        />
      )}

      <ModalConfirmar abierto={!!aEliminar} titulo="¿Eliminar suceso?"
        mensaje={aEliminar ? `Vas a eliminar el suceso EV-${String(aEliminar.id).padStart(4, '0')}.` : ''}
        onConfirmar={confirmarEliminar} onCancelar={() => setAEliminar(null)}
        textoConfirmar="Eliminar" peligro />
    </>
  );
}