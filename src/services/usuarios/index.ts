/**
 * Servicios del MS Usuarios (BFF → nginx → MS Users :3001)
 *
 * Documentación completa: context/Readme_ms_usuarios.md
 * Esquema BD: context/init-all.sql (tablas permisos, roles, usuarios, tokens_refresco)
 */
export { authService } from './authService'
export { usuariosService } from './usuariosService'
export { rolesService } from './rolesService'
export { permisosService } from './permisosService'
