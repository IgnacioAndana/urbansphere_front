import api from './api';

// Interfaces tipadas basadas en el esquema de la BD y Postman de Ignacio
export interface LoginCredentials {
  correo_electronico: string; // Mapeado exacto a la BD
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    correo_electronico: string;
    rol: string;
  };
}

export const authService = {
  /**
   * Envía las credenciales al backend para obtener el token JWT
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Apunta al endpoint real del microservicio mapeado en Postman
    const response = await api.post<AuthResponse>('/autenticacion/iniciar-sesion', {
      correo: credentials.correo_electronico,
      contrasena: credentials.contrasena
    });
    
    // Si la respuesta trae un token, lo almacenamos de forma persistente
    if (response.data && response.data.token) {
      localStorage.setItem('urbansphere_token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * Elimina las credenciales del almacenamiento local
   */
  logout(): void {
    localStorage.removeItem('urbansphere_token');
  }
};