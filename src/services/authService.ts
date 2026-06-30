import api from './api';

export interface LoginCredentials {
  correo_electronico: string;
  contrasena: string;
}

export interface AuthResponse {
  tokenAcceso: string;
  tokenRefresco: string;
  expiraEn: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    creadoEn: string;
  };
}

export interface RegisterData {
  nombre: string;
  email: string;
  contrasena: string;
  rolId?: number;
}

export const authService = {
  /**
   * Envía las credenciales al backend para obtener los tokens JWT
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/autenticacion/iniciar-sesion', {
      email: credentials.correo_electronico,
      contrasena: credentials.contrasena
    });
    
    if (response.data && response.data.tokenAcceso) {
      localStorage.setItem('urbansphere_token', response.data.tokenAcceso);
      localStorage.setItem('urbansphere_refresh_token', response.data.tokenRefresco);
      localStorage.setItem('urbansphere_user', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  },

  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterData): Promise<any> {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(): Promise<any> {
    const response = await api.get('/autenticacion/perfil');
    return response.data;
  },

  /**
   * Obtiene la lista de usuarios (Requiere token)
   */
  async getUsers(): Promise<any[]> {
    const response = await api.get('/usuarios');
    return response.data;
  },

  /**
   * Actualiza un usuario (Requiere token)
   */
  async updateUser(id: number, data: Partial<RegisterData>): Promise<any> {
    const response = await api.patch(`/usuarios/${id}`, data);
    return response.data;
  },

  /**
   * Elimina un usuario por ID (Requiere token)
   */
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },

  /**
   * Elimina las credenciales del almacenamiento local (y podría notificar al backend)
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('urbansphere_refresh_token');
    if (refreshToken) {
      try {
        await api.post('/autenticacion/cerrar-sesion', { tokenRefresco: refreshToken });
      } catch (e) {
        console.warn('Error al cerrar sesión en el backend', e);
      }
    }
    localStorage.removeItem('urbansphere_token');
    localStorage.removeItem('urbansphere_refresh_token');
    localStorage.removeItem('urbansphere_user');
  }
};