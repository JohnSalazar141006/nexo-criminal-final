import axios, { AxiosInstance } from 'axios';
import type {
  Persona, Vehiculo, Ubicacion, Suceso, Alerta, Vinculo,
  Relacion, UserSession, GrafoData, EstadoAlerta
} from '../types';

const API_BASE = '/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: adjunta el token JWT en cada peticion
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
export const authService = {
  login: async (username: string, password: string): Promise<UserSession> => {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },
};

// ---- Personas ----
export const personaService = {
  listar: async (): Promise<Persona[]> => (await api.get('/personas')).data,
  obtener: async (id: number): Promise<Persona> => (await api.get(`/personas/${id}`)).data,
  crear:  async (p: Persona): Promise<Persona> => (await api.post('/personas', p)).data,
  actualizar: async (id: number, p: Persona): Promise<Persona> => (await api.put(`/personas/${id}`, p)).data,
  eliminar: async (id: number): Promise<void> => { await api.delete(`/personas/${id}`); },
  intermediarios: async (victimaId: number, sospechosoId: number): Promise<Persona[]> =>
    (await api.get('/personas/intermediarios', { params: { victimaId, sospechosoId } })).data,
};

// ---- Vehiculos ----
export const vehiculoService = {
  listar: async (estado?: string): Promise<Vehiculo[]> =>
    (await api.get('/vehiculos', { params: estado ? { estado } : {} })).data,
  obtener: async (id: number): Promise<Vehiculo> => (await api.get(`/vehiculos/${id}`)).data,
  crear: async (v: Vehiculo): Promise<Vehiculo> => (await api.post('/vehiculos', v)).data,
  actualizar: async (id: number, v: Vehiculo): Promise<Vehiculo> => (await api.put(`/vehiculos/${id}`, v)).data,
  cambiarEstado: async (id: number, estado: string): Promise<Vehiculo> =>
    (await api.patch(`/vehiculos/${id}/estado`, { estado })).data,
  eliminar: async (id: number): Promise<void> => { await api.delete(`/vehiculos/${id}`); },
};

// ---- Ubicaciones ----
export const ubicacionService = {
  listar: async (): Promise<Ubicacion[]> => (await api.get('/ubicaciones')).data,
  crear: async (u: Ubicacion): Promise<Ubicacion> => (await api.post('/ubicaciones', u)).data,
  eliminar: async (id: number): Promise<void> => { await api.delete(`/ubicaciones/${id}`); },
};

// ---- Sucesos ----
export const sucesoService = {
  listar: async (tipo?: string): Promise<Suceso[]> =>
    (await api.get('/sucesos', { params: tipo ? { tipo } : {} })).data,
  crear: async (s: Suceso): Promise<Suceso> => (await api.post('/sucesos', s)).data,
  eliminar: async (id: number): Promise<void> => { await api.delete(`/sucesos/${id}`); },
};

// ---- Relaciones ----
export const relacionService = {
  listar: async (): Promise<Relacion[]> => (await api.get('/relaciones')).data,
  crear: async (r: Relacion): Promise<Relacion> => (await api.post('/relaciones', r)).data,
};

// ---- Alertas ----
export const alertaService = {
  listar: async (pendientes = false): Promise<Alerta[]> =>
    (await api.get('/alertas', { params: pendientes ? { pendientes: true } : {} })).data,
  cambiarEstado: async (id: number, estado: EstadoAlerta): Promise<Alerta> =>
    (await api.patch(`/alertas/${id}/estado`, { estado })).data,
};

// ---- Motor Red Thread ----
export const engineService = {
  ejecutarTodo: async () => (await api.post('/engine/ejecutar-todo')).data,
  nodoLogistico: async () => (await api.post('/engine/nodo-logistico')).data,
  escolta: async () => (await api.post('/engine/escolta')).data,
  circulo: async () => (await api.post('/engine/circulo-confianza')).data,
  modus: async () => (await api.post('/engine/modus-operandi')).data,
};

// ---- Grafo ----
export const grafoService = {
  completo: async (): Promise<GrafoData> => (await api.get('/grafo/completo')).data,
};

// ---- Vinculos ----
export const vinculoService = {
  listar: async (): Promise<Vinculo[]> => (await api.get('/vinculos')).data,
};

export default api;
