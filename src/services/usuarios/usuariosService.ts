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
import { normalizarUsuarioApi } from '../../utils/normalizarUsuario'
import { authService } from './authService'

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
    const { data } = await api.get<unknown[]>('/usuarios')
    return (Array.isArray(data) ? data : [])
      .map((item) => normalizarUsuarioApi(item))
      .filter((u): u is Usuario => u !== null)
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

  /** PATCH perfil propio — id desde GET /autenticacion/perfil (misma fuente que valida el backend) */
  async actualizarMiPerfil(dto: ActualizarPerfilPropioDto): Promise<Usuario> {
    const perfil = await authService.obtenerPerfil()
    if (!perfil?.id) throw new Error('No hay sesión activa')
    return this.actualizar(perfil.id, dto)
  },

  /** DELETE /usuarios/:id — solo admin */
  async eliminar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`)
  },
}
