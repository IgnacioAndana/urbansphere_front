import api from '../api';

export const favoritosService = {
  /** GET /favoritos/ids — Obtiene los IDs de los proyectos favoritos del usuario (requiere JWT) */
  async obtenerIdsFavoritos(): Promise<number[]> {
    const { data } = await api.get<{ proyectoIds: number[] }>('/favoritos/ids');
    return data.proyectoIds || [];
  },

  /** GET /favoritos/proyecto/:proyectoId — Verifica si un proyecto está en favoritos (requiere JWT) */
  async esFavorito(proyectoId: number): Promise<boolean> {
    try {
      await api.get(`/favoritos/proyecto/${proyectoId}`);
      return true;
    } catch {
      return false;
    }
  },

  /** POST /favoritos — Añade un proyecto a favoritos (requiere JWT) */
  async agregarFavorito(proyectoId: number): Promise<void> {
    await api.post('/favoritos', { proyectoId });
  },

  /** DELETE /favoritos/:proyectoId — Elimina un proyecto de favoritos (requiere JWT) */
  async eliminarFavorito(proyectoId: number): Promise<void> {
    await api.delete(`/favoritos/${proyectoId}`);
  },

  /** GET /favoritos — Obtiene el listado completo de los favoritos del usuario (requiere JWT) */
  async obtenerFavoritos(): Promise<any[]> {
    const { data } = await api.get<any[]>('/favoritos');
    return data;
  }
};
