import { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import { grafoService, engineService } from '../services/api';

export default function Grafo() {
  const contRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState('');
  const [detalle, setDetalle] = useState<string>('');

  const cargarGrafo = async () => {
    setCargando(true);
    try {
      const data = await grafoService.completo();
      const elementos: ElementDefinition[] = [
        ...data.nodes.map(n => ({ group: 'nodes' as const, data: n.data })),
        ...data.edges.map(e => ({ group: 'edges' as const, data: e.data })),
      ];

      if (cyRef.current) cyRef.current.destroy();

      cyRef.current = cytoscape({
        container: contRef.current!,
        elements: elementos,
        style: [
          // --- Nodos base ---
          {
            selector: 'node',
            style: {
              'label': 'data(label)',
              'color': '#e8e8ed',
              'font-size': '11px',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'text-margin-y': 6,
              'width': 30,
              'height': 30,
              'border-width': 2,
              'border-color': '#2c2f3a',
            }
          },
          { selector: 'node[tipo = "PERSONA"]',   style: { 'background-color': '#1976d2', 'shape': 'ellipse' } },
          { selector: 'node[tipo = "VEHICULO"]',  style: { 'background-color': '#f9a825', 'shape': 'round-rectangle' } },
          { selector: 'node[tipo = "UBICACION"]', style: { 'background-color': '#2e7d32', 'shape': 'diamond' } },
          { selector: 'node[tipo = "SUCESO"]',    style: { 'background-color': '#c62828', 'shape': 'triangle' } },
          {
            selector: 'node[?sospechoso]',
            style: {
              'border-color': '#c62828',
              'border-width': 4,
              'background-color': '#ef5350',
            }
          },
          {
            selector: 'node[subtipo = "ROBADO"]',
            style: { 'border-color': '#c62828', 'border-width': 3 }
          },
          {
            selector: 'node[subtipo = "VEHICULO_APOYO"]',
            style: { 'border-color': '#f9a825', 'border-width': 3 }
          },
          // --- Aristas ---
          {
            selector: 'edge',
            style: {
              'width': 2,
              'curve-style': 'bezier',
              'target-arrow-shape': 'triangle',
              'line-color': '#9aa0a6',
              'target-arrow-color': '#9aa0a6',
            }
          },
          {
            selector: 'edge[tipo = "HILO_ROJO"]',
            style: {
              'line-color': '#c62828',
              'target-arrow-color': '#c62828',
              'width': 3,
              'line-style': 'solid',
              'label': 'data(regla)',
              'font-size': '9px',
              'color': '#ef5350',
              'text-background-color': '#0e0f14',
              'text-background-opacity': 0.8,
              'text-background-padding': '2px',
            }
          },
          {
            selector: 'edge[tipo = "DIRECTO"]',
            style: { 'line-style': 'dashed', 'line-color': '#666' }
          },
        ],
        layout: {
          name: 'cose',
          animate: false,
          idealEdgeLength: () => 120,
          nodeRepulsion: () => 8000,
          padding: 30,
        } as any,
      });

      cyRef.current.on('tap', 'node', (e) => {
        const n = e.target.data();
        setDetalle(`${n.tipo}: ${n.label}\nSubtipo: ${n.subtipo || '—'}\nID: ${n.id}`);
      });

      cyRef.current.on('tap', 'edge', (e) => {
        const ed = e.target.data();
        setDetalle(`Vínculo: ${ed.regla}\nOrigen: ${ed.source}\nDestino: ${ed.target}\nScore: ${ed.score ?? 'N/A'}`);
      });

      setMsg(`${data.nodes.length} nodos, ${data.edges.length} aristas cargados`);
    } catch (e) {
      setMsg('❌ Error al cargar el grafo');
    } finally {
      setCargando(false);
    }
  };

  const ejecutarMotor = async () => {
    setCargando(true);
    setMsg('Ejecutando motor...');
    try {
      const r = await engineService.ejecutarTodo();
      setMsg(`✅ Motor: ${r.totalVinculos} vínculos, ${r.totalAlertas} alertas`);
      await cargarGrafo();
    } catch {
      setMsg('❌ Error al ejecutar el motor');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGrafo();
    return () => { cyRef.current?.destroy(); };
  }, []);

  return (
    <>
      <h2>🧵 Grafo — Red Thread</h2>

      <div className="toolbar">
        <button onClick={cargarGrafo} disabled={cargando}>🔄 Recargar grafo</button>
        <button onClick={ejecutarMotor} disabled={cargando}>▶ Ejecutar motor y recargar</button>
        {msg && <span style={{ marginLeft: '1rem', alignSelf: 'center', fontSize: '0.9rem' }}>{msg}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' }}>
        <div ref={contRef} className="grafo-container" />
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title">Leyenda</div>
          <div style={{ fontSize: '0.85rem', lineHeight: 1.9 }}>
            <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#1976d2', borderRadius: '50%', marginRight: 6 }} />Persona</div>
            <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#f9a825', marginRight: 6 }} />Vehículo</div>
            <div><span style={{ display: 'inline-block', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '12px solid #2e7d32', marginRight: 6 }} />Ubicación</div>
            <div><span style={{ display: 'inline-block', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '12px solid #c62828', marginRight: 6 }} />Suceso</div>
            <hr style={{ borderColor: 'var(--borde)', margin: '0.5rem 0' }} />
            <div><span style={{ display: 'inline-block', width: 18, height: 3, background: '#c62828', marginRight: 6, verticalAlign: 'middle' }} />Hilo Rojo (vínculo)</div>
            <div><span style={{ display: 'inline-block', width: 18, height: 3, background: '#666', marginRight: 6, verticalAlign: 'middle' }} />Relación directa</div>
          </div>
          <hr style={{ borderColor: 'var(--borde)', margin: '1rem 0' }} />
          <div className="card-title">Detalle</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: 'var(--texto-suave)', margin: 0 }}>
            {detalle || 'Haz click en un nodo o arista.'}
          </pre>
        </div>
      </div>
    </>
  );
}
