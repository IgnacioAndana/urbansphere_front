/**
 * MS Usuarios — CRUD de usuarios
 *
 * Permisos por rol (sin tablas permisos):
 * | Acción              | admin | agent | user        |
 * |---------------------|-------|-------|-------------|
 * | POST sin JWT        | user  | user  | user        |
 * | POST con JWT        | ✅    | ❌    | ❌          |
 * | GET listado         | ✅    | ✅    | ❌          |
 * | PATCH propio id     | ✅    | ✅    | ✅ (limitado)|
 * | PATCH cualquier id  | ✅    | ✅    | ❌          |
 * | DELETE              | ✅    | ❌    | ❌          |
 */
import api from '../api'
import type {
  ActualizarPerfilPropioDto,
  ActualizarUsuarioDto,
  CrearUsuarioAdminDto,
  RegistrarUsuarioDto,
  Usuario,
} from '../../types/usuarios'

export const usuariosService = {
  /** POST /usuarios — Registro público (sin JWT, rol user) */
  async registrarPublico(dto: RegistrarUsuarioDto): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/usuarios', dto)
    return data
  },

  /** POST /usuarios — Crear usuario con rol (JWT admin) */
  async crear(dto: CrearUsuarioAdminDto): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/usuarios', dto)
    return data
  },

  /** GET /usuarios — admin y agent */
  async listar(): Promise<Usuario[]> {
    const { data } = await api.get<Usuario[]>('/usuarios')
    return data
  },

  async obtenerPorId(id: number): Promise<Usuario> {
    const { data } = await api.get<Usuario>(`/usuarios/${id}`)
    return data
  },

  /** PATCH /usuarios/:id */
  async actualizar(id: number, dto: ActualizarUsuarioDto): Promise<Usuario> {
    const { data } = await api.patch<Usuario>(`/usuarios/${id}`, dto)
    return data
  },

  /** PATCH perfil propio — nombre, email, contrasena */
  async actualizarPerfilPropio(id: number, dto: ActualizarPerfilPropioDto): Promise<Usuario> {
    return this.actualizar(id, dto)
  },

  /** DELETE /usuarios/:id — solo admin */
  async eliminar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`)
  },
}
