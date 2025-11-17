// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error);
    return Promise.reject(error);
  }
);

export const api = {
  // ==================== EQUIPOS ====================
  
  // Obtener todos los equipos
  getEquipos: async () => {
    try {
      const response = await apiClient.get('/equipos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      throw error;
    }
  },

  // Obtener un equipo por ID
  getEquipo: async (id) => {
    try {
      const response = await apiClient.get(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener equipo:', error);
      throw error;
    }
  },

  // Crear nuevo equipo
  createEquipo: async (equipoData) => {
    try {
      const response = await apiClient.post('/equipos', equipoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear equipo:', error);
      throw error;
    }
  },

  // Actualizar equipo
  updateEquipo: async (id, equipoData) => {
    try {
      const response = await apiClient.put(`/equipos/${id}`, equipoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      throw error;
    }
  },

  // Eliminar equipo
  deleteEquipo: async (id) => {
    try {
      const response = await apiClient.delete(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      throw error;
    }
  },

  // ==================== MOVIMIENTOS ====================
  
  // Obtener todos los movimientos
  getMovimientos: async () => {
    try {
      const response = await apiClient.get('/movimientos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      throw error;
    }
  },

  // Registrar ingreso
  registrarIngreso: async (equipoId, usuarioId = 1, observaciones = '') => {
    try {
      const response = await apiClient.post('/movimientos/ingreso', {
        equipo_id: equipoId,
        usuario_id: usuarioId,
        observaciones: observaciones
      });
      return response.data;
    } catch (error) {
      console.error('Error al registrar ingreso:', error);
      throw error;
    }
  },

  // Registrar salida
  registrarSalida: async (equipoId, usuarioId = 1, observaciones = '') => {
    try {
      const response = await apiClient.post('/movimientos/salida', {
        equipo_id: equipoId,
        usuario_id: usuarioId,
        observaciones: observaciones
      });
      return response.data;
    } catch (error) {
      console.error('Error al registrar salida:', error);
      throw error;
    }
  },

  // Obtener movimientos por rango de fechas
  getMovimientosPorRango: async (fechaInicio, fechaFin) => {
    try {
      const response = await apiClient.get('/movimientos/rango', {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener movimientos por rango:', error);
      throw error;
    }
  },

  // ==================== ESTADÍSTICAS ====================
  
  // Obtener estadísticas del dashboard
  getEstadisticas: async () => {
    try {
      const response = await apiClient.get('/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // ==================== REPORTES ====================
  
  // Generar reporte
  generarReporte: async (fechaInicio = '', fechaFin = '') => {
    try {
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      
      const response = await apiClient.get('/reportes/generar', { params });
      return response.data;
    } catch (error) {
      console.error('Error al generar reporte:', error);
      throw error;
    }
  },

  // ==================== USUARIOS ====================
  
  // Obtener todos los usuarios
  getUsuarios: async () => {
    try {
      const response = await apiClient.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================
  
  // Verificar conexión con el backend
  checkConnection: async () => {
    try {
      const response = await axios.get('http://localhost:3001/');
      return response.data;
    } catch (error) {
      console.error('Error de conexión con el backend:', error);
      return null;
    }
  }
};

export default api;