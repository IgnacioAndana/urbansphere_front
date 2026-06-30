/**
 * MS Usuarios — CRUD de usuarios
 *
 * Endpoints (prefijo /api vía BFF):
 * | Método | Ruta            | Auth | Componente(s)              |
 * |--------|-----------------|------|----------------------------|
 * | POST   | /usuarios       | No   | (registro público futuro)  |
 * | GET    | /usuarios       | JWT  | (vista admin usuarios)     |
 * | GET    | /usuarios/:id   | JWT  | (detalle usuario)          |
 * | PATCH  | /usuarios/:id   | JWT  | (editar usuario)           |
 * | DELETE | /usuarios/:id   | JWT  | (eliminar usuario)         |
 *
 * Tabla BD: usuarios (nombre, email, hash_contrasena, rol_id, activo)
 * FK: rol_id → roles (admin=1, user=2, agent=3 tras seed)
 */
import api from '../api'
import type {
  ActualizarUsuarioDto,
  RegistrarUsuarioDto,
  Usuario,
} from '../../types/usuarios'

export const usuariosService = {
  /** POST /usuarios — Registro sin autenticación */
  async registrar(dto: RegistrarUsuarioDto): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/usuarios', dto)
    return data
  },

  /** GET /usuarios — Listado (requiere JWT, típicamente rol admin) */
  async listar(): Promise<Usuario[]> {
    const { data } = await api.get<Usuario[]>('/usuarios')
    return data
  },

  /** GET /usuarios/:id */
  async obtenerPorId(id: number): Promise<Usuario> {
    const { data } = await api.get<Usuario>(`/usuarios/${id}`)
    return data
  },

  /** PATCH /usuarios/:id — Actualizar nombre, email, contrasena, rolId o activo */
  async actualizar(id: number, dto: ActualizarUsuarioDto): Promise<Usuario> {
    const { data } = await api.patch<Usuario>(`/usuarios/${id}`, dto)
    return data
  },

  /** DELETE /usuarios/:id */
  async eliminar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`)
  },
}
