import { useEffect, useState } from 'react';
import { desaparecidaService } from '../services/api';
import type {
  PersonaDesaparecida, EstadoDesaparicion, PrioridadDesaparicion, Ubicacion,
} from '../types';

interface Props {
  inicial: PersonaDesaparecida | null;
  ubicaciones: Ubicacion[];
  onGuardado: () => void;
  onCancelar: () => void;
}

const formatoFechaInput = (iso?: string) => {
  if (!iso) return new Date().toISOString().slice(0, 16);
  return new Date(iso).toISOString().slice(0, 16);
};

const formatoFechaSimple = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
};

export default function FormularioDesaparecida({ inicial, ubicaciones, onGuardado, onCancelar }: Props) {
  const [form, setForm] = useState<PersonaDesaparecida>({
    documento: '',
    nombre: '',
    apellido: '',
    fechaDesaparicion: new Date().toISOString().slice(0, 16),
    estado: 'BUSCADA' as EstadoDesaparicion,
    prioridad: 'MEDIA' as PrioridadDesaparicion,
  });

  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<'datos' | 'fisico' | 'circunstancias' | 'reportante'>('datos');

  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (inicial) {
      setForm({
        ...inicial,
        fechaDesaparicion: formatoFechaInput(inicial.fechaDesaparicion),
        fechaNacimiento: formatoFechaSimple(inicial.fechaNacimiento),
      });
      if (inicial.fotoUrl) setPreviewUrl(inicial.fotoUrl);
    }
  }, [inicial]);

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErr('Solo se permiten archivos de imagen');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('La imagen no puede superar los 5MB');
      return;
    }

    setArchivo(file);
    setErr('');

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setOk('');
    setGuardando(true);

    try {
      // Preparar payload
      const payload: PersonaDesaparecida = {
        ...form,
        ultimaUbicacion: form.ultimaUbicacion?.id ? { id: form.ultimaUbicacion.id } as Ubicacion : null,
      };

      let id: number;

      if (inicial?.id) {
        const actualizada = await desaparecidaService.actualizar(inicial.id, payload);
        id = actualizada.id!;
      } else {
        const creada = await desaparecidaService.crear(payload);
        id = creada.id!;
      }

      // Subir foto si hay archivo nuevo
      if (archivo) {
        await desaparecidaService.subirFoto(id, archivo);
      }

      setOk(inicial ? 'Caso actualizado correctamente' : 'Caso registrado correctamente');
      setTimeout(() => onGuardado(), 1000);
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'Error al guardar el caso');
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {/* Tabs de secciones */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 20,
        borderBottom: '1px solid var(--slate-800)',
        paddingBottom: 12,
        flexWrap: 'wrap',
      }}>
        <button type="button" className={`option-chip ${seccion === 'datos' ? 'active' : ''}`}
          onClick={() => setSeccion('datos')}>1. Identificación</button>
        <button type="button" className={`option-chip ${seccion === 'fisico' ? 'active' : ''}`}
          onClick={() => setSeccion('fisico')}>2. Datos físicos</button>
        <button type="button" className={`option-chip ${seccion === 'circunstancias' ? 'active' : ''}`}
          onClick={() => setSeccion('circunstancias')}>3. Circunstancias</button>
        <button type="button" className={`option-chip ${seccion === 'reportante' ? 'active' : ''}`}
          onClick={() => setSeccion('reportante')}>4. Reportante</button>
      </div>

      {/* Sección 1: Identificación */}
      {seccion === 'datos' && (
        <>
          {/* Foto */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              position: 'relative',
              marginBottom: 10,
            }}>
              {previewUrl ? (
                <img src={previewUrl} alt="Vista previa" style={{
                  width: 150, height: 150, objectFit: 'cover',
                  border: '2px solid var(--red-500)',
                  borderRadius: 4,
                }} />
              ) : (
                <div style={{
                  width: 150, height: 150,
                  background: 'var(--slate-950)',
                  border: '2px dashed var(--slate-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'var(--slate-600)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48 }}>photo_camera</span>
                  <div style={{ fontSize: 10, marginTop: 4 }}>Sin foto</div>
                </div>
              )}
            </div>
            <div>
              <label className="btn-ghost" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upload</span>
                {archivo || previewUrl ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" accept="image/*" onChange={handleArchivo} style={{ display: 'none' }} />
              </label>
              <div style={{ fontSize: 10, color: 'var(--slate-600)', marginTop: 6 }}>
                Máximo 5MB · JPG, PNG, WebP
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="form-group">
              <label className="form-label">Documento / ID</label>
              <input value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
                placeholder="ID-000-0000" required />
            </div>
            <div className="form-group">
              <label className="form-label">Alias / Apodo</label>
              <input value={form.alias || ''}
                onChange={(e) => setForm({ ...form, alias: e.target.value })}
                placeholder="Apodo conocido" />
            </div>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre" required />
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                placeholder="Apellido" required />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de nacimiento</label>
              <input type="date" value={form.fechaNacimiento || ''}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Género</label>
              <select value={form.genero || ''}
                onChange={(e) => setForm({ ...form, genero: e.target.value })}>
                <option value="">— Seleccionar —</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="NO_BINARIO">No binario</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado del caso</label>
              <select value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoDesaparicion })}>
                <option value="BUSCADA">Buscada</option>
                <option value="ENCONTRADA_VIVA">Encontrada con vida</option>
                <option value="ENCONTRADA_FALLECIDA">Encontrada fallecida</option>
                <option value="ARCHIVADA">Archivada</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select value={form.prioridad}
                onChange={(e) => setForm({ ...form, prioridad: e.target.value as PrioridadDesaparicion })}>
                <option value="CRITICA">Crítica</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Sección 2: Datos físicos */}
      {seccion === 'fisico' && (
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label className="form-label">Estatura (cm)</label>
            <input type="number" value={form.estaturaCm || ''}
              onChange={(e) => setForm({ ...form, estaturaCm: Number(e.target.value) || undefined })}
              placeholder="170" />
          </div>
          <div className="form-group">
            <label className="form-label">Peso (kg)</label>
            <input type="number" value={form.pesoKg || ''}
              onChange={(e) => setForm({ ...form, pesoKg: Number(e.target.value) || undefined })}
              placeholder="70" />
          </div>
          <div className="form-group">
            <label className="form-label">Contextura</label>
            <select value={form.contextura || ''}
              onChange={(e) => setForm({ ...form, contextura: e.target.value })}>
              <option value="">— Seleccionar —</option>
              <option value="DELGADA">Delgada</option>
              <option value="MEDIA">Media</option>
              <option value="ROBUSTA">Robusta</option>
              <option value="ATLETICA">Atlética</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Color de cabello</label>
            <input value={form.colorCabello || ''}
              onChange={(e) => setForm({ ...form, colorCabello: e.target.value })}
              placeholder="Negro, castaño..." />
          </div>
          <div className="form-group">
            <label className="form-label">Color de ojos</label>
            <input value={form.colorOjos || ''}
              onChange={(e) => setForm({ ...form, colorOjos: e.target.value })}
              placeholder="Marrones, verdes..." />
          </div>
          <div className="form-group full">
            <label className="form-label">Señas particulares</label>
            <textarea rows={3} value={form.señasParticulares || ''}
              onChange={(e) => setForm({ ...form, señasParticulares: e.target.value })}
              placeholder="Tatuajes, cicatrices, lunares, prótesis..." />
          </div>
          <div className="form-group full">
            <label className="form-label">Ropa al desaparecer</label>
            <textarea rows={3} value={form.ropaAlDesaparecer || ''}
              onChange={(e) => setForm({ ...form, ropaAlDesaparecer: e.target.value })}
              placeholder="Descripción de la vestimenta que llevaba..." />
          </div>
        </div>
      )}

      {/* Sección 3: Circunstancias */}
      {seccion === 'circunstancias' && (
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-group">
            <label className="form-label">Fecha y hora de la desaparición</label>
            <input type="datetime-local" value={form.fechaDesaparicion}
              onChange={(e) => setForm({ ...form, fechaDesaparicion: e.target.value })}
              required />
          </div>
          <div className="form-group">
            <label className="form-label">
              Última ubicación conocida
              <span className="entity-counter">{ubicaciones.length}</span>
            </label>
            <select value={form.ultimaUbicacion?.id || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setForm({
                  ...form,
                  ultimaUbicacion: ubicaciones.find(u => u.id === id) || null,
                });
              }}>
              <option value="">— Sin ubicación registrada —</option>
              {ubicaciones.map(u => (
                <option key={u.id} value={u.id}>
                  {u.direccion || `Ubicación #${u.id}`}
                </option>
              ))}
            </select>
            <div style={{ fontSize: 10, color: 'var(--slate-500)', marginTop: 4 }}>
              Si la ubicación no existe, registrala primero en Ubicaciones.
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Circunstancias de la desaparición</label>
            <textarea rows={6} value={form.circunstancias || ''}
              onChange={(e) => setForm({ ...form, circunstancias: e.target.value })}
              placeholder="Describí las circunstancias en las que ocurrió la desaparición: con quién estaba, qué hacía, hacia dónde se dirigía, posibles motivos, testigos, etc." />
          </div>
        </div>
      )}

      {/* Sección 4: Reportante */}
      {seccion === 'reportante' && (
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group full">
            <label className="form-label">Nombre del reportante</label>
            <input value={form.reportanteNombre || ''}
              onChange={(e) => setForm({ ...form, reportanteNombre: e.target.value })}
              placeholder="Nombre completo de quien reporta" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono de contacto</label>
            <input value={form.reportanteTelefono || ''}
              onChange={(e) => setForm({ ...form, reportanteTelefono: e.target.value })}
              placeholder="+00 000 000 0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Relación con la persona</label>
            <select value={form.reportanteRelacion || ''}
              onChange={(e) => setForm({ ...form, reportanteRelacion: e.target.value })}>
              <option value="">— Seleccionar —</option>
              <option value="MADRE">Madre</option>
              <option value="PADRE">Padre</option>
              <option value="HIJO/A">Hijo/a</option>
              <option value="HERMANO/A">Hermano/a</option>
              <option value="CONYUGE">Cónyuge</option>
              <option value="PAREJA">Pareja</option>
              <option value="AMIGO/A">Amigo/a</option>
              <option value="COMPAÑERO_LABORAL">Compañero laboral</option>
              <option value="VECINO">Vecino</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
        </div>
      )}

      {err && <div className="error" style={{ marginTop: 16 }}>{err}</div>}
      {ok && <div className="success" style={{ marginTop: 16 }}>{ok}</div>}

      <div style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 16,
        borderTop: '1px solid var(--slate-800)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--slate-500)' }}>
          {seccion === 'datos' && 'Sección 1 de 4'}
          {seccion === 'fisico' && 'Sección 2 de 4'}
          {seccion === 'circunstancias' && 'Sección 3 de 4'}
          {seccion === 'reportante' && 'Sección 4 de 4'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-ghost" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={guardando}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
            {guardando ? 'Guardando...' : (inicial ? 'Actualizar caso' : 'Registrar caso')}
          </button>
        </div>
      </div>
    </form>
  );
}