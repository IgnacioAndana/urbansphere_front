# 🏢 UrbanSphere - Frontend Comercial Inmobiliario

UrbanSphere es una plataforma web de inteligencia inmobiliaria diseñada para optimizar la visualización de catálogos comerciales y agilizar la gestión interna de proyectos habitacionales. Este repositorio contiene el desarrollo de la **Capa de Presentación (Frontend)**.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** Vue 3 (Composition API con `<script setup>`)
* **Lenguaje:** TypeScript (Tipado Estricto)
* **Estilos:** Tailwind CSS v4 (Arquitectura basada en utilidades nativas estándar)
* **Entorno de Construcción:** Vite (Optimización de recarga en caliente HMR)
* **Cliente HTTP:** Axios (Instancia centralizada con interceptores globales de seguridad)
* **Mapas:** Leaflet (Visualización e interacción de mapas georreferenciados sin APIs de pago)

---

## 🗺️ Estado del Arte & Características Implementadas (Entrega EA2)

### 1. Ecosistema de Diseño de Alta Fidelidad (Pixel-Perfect)
* **Catálogo Comercial:** Panel lateral responsivo con tarjetas de propiedades que despliegan datos atómicos y estatus comercial ("En Venta").
* **Identidad Visual Corporativa:** Integración limpia del Imagotipo e Isotipo oficiales de la marca, eliminando advertencias visuales mediante el estándar `:root` de CSS nativo.
* **Control de Acceso Administrador (Login):** Interfaz a pantalla dividida optimizada con captura reactiva de credenciales mediante formularios controlados.

### 2. Mapa Comercial Interactivo (Leaflet Integration)
* Renderizado dinámico de mapas centrado en la Región Metropolitana.
* Capa de diseño estilizada mediante *CartoDB Voyager* para una visualización premium y limpia de las calles.
* Marcadores (*Markers*) totalmente personalizados utilizando Tailwind CSS para inyectar los precios reales de los activos inmobiliarios diretamente sobre el lienzo interactivo.

### 3. Arquitectura de Red y Conectividad (Axios Core)
* **Instancia Centralizada:** Configuración del cliente en `src/services/api.ts` apuntando de forma nativa a la arquitectura del backend distribuido.
* **Manejo Automático de JWT:** Interceptor de peticiones encargado de capturar e inyectar el token de autorización en la cabecera `Bearer` de cada llamada saliente.
* **Seguridad & Sesión:** Interceptor de respuestas preparado para interceptar errores de red globales (`401 Unauthorized`) para limpiar el `localStorage` y forzar la redirección segura al login.

---

## 🚀 Primeros pasos (clonar y levantar en local)

Guía rápida para que cualquier integrante del equipo pueda correr el front en su máquina.

### Requisitos previos

- **Node.js** 20 o superior ([nodejs.org](https://nodejs.org/))
- **npm** (viene con Node)
- Acceso al **BFF/API** del proyecto (URL base con prefijo `/api`)

Comprueba que tienes Node instalado:

```bash
node -v
npm -v
```

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Front_UrbanSphere
```

### 2. Instalar dependencias

```bash
npm install
```

> Si aparece un error relacionado con `@vue/tsconfig` o módulos faltantes, vuelve a ejecutar `npm install` dentro de la carpeta del proyecto.

### 3. Configurar variables de entorno (`.env`)

El archivo `.env` **no se sube a Git** (está en `.gitignore`). Cada desarrollador debe crear el suyo a partir del ejemplo:

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Luego abre `.env` y revisa la variable:

```env
# URL base del BFF (nginx → microservicios). Debe incluir el prefijo /api.
VITE_API_BASE_URL=http://13.222.88.101/api
```

| Variable | Descripción |
|----------|-------------|
| `VITE_API_BASE_URL` | URL del backend. Todas las peticiones (login, usuarios, etc.) se hacen contra esta base + la ruta del servicio. **Debe terminar en `/api`.** |

**Valores habituales:**

- **Servidor del equipo (actual):** `http://13.222.88.101/api`
- **Backend en tu PC:** por ejemplo `http://localhost:3001/api` (ajusta puerto según tu BFF)

> Las variables de Vite deben empezar con `VITE_` para que el front pueda leerlas. Si cambias el `.env`, **reinicia** el servidor de desarrollo (`Ctrl+C` y luego `npm run dev`).

### 4. Levantar el servidor de desarrollo

```bash
npm run dev
```

Vite mostrará una URL local, normalmente:

```
http://localhost:5173
```

Abre esa URL en el navegador. Desde ahí puedes:

- Ver el **catálogo público** (`/`)
- **Iniciar sesión** (`/login`) con un usuario del MS Usuarios
- Entrar al **panel admin** si tu rol es admin o agent

### 5. Otros comandos útiles

```bash
# Compilar para producción (verifica tipos + build)
npm run build

# Previsualizar el build de producción
npm run preview
```

---

## 🔐 Login y roles

El front consume el **MS Usuarios** a través del BFF. Los roles son:

| ID | Rol | Acceso |
|----|-----|--------|
| 1 | Admin | Panel admin, gestión de usuarios |
| 2 | Usuario | Catálogo + editar su perfil |
| 3 | Agente | Panel admin (sin crear/eliminar usuarios) |

Pide al equipo las **credenciales de prueba** y confirma que el BFF esté disponible antes de probar el login.

---

## 📁 Estructura relevante del proyecto

```
Front_UrbanSphere/
├── .env.example          # Plantilla de variables (copiar a .env)
├── .env                  # Tu configuración local (no commitear)
├── src/
    ├── config/env.ts     # Lee VITE_API_BASE_URL
    ├── services/         # Llamadas al API (axios)
    ├── views/            # Pantallas (login, catálogo, admin…)
    ├── layouts/          # PublicLayout, AdminLayout
    └── components/       # Modales y componentes reutilizables
```

---

## ❓ Problemas frecuentes

| Problema | Qué revisar |
|----------|-------------|
| Error 401 al hacer login | Email/contraseña correctos; que el BFF esté arriba y la URL en `.env` sea la correcta |
| `Network Error` / no conecta | `VITE_API_BASE_URL` mal escrita, BFF caído o firewall |
| Cambié `.env` y no surte efecto | Reiniciar `npm run dev` |
| `Cannot find module '@vue/tsconfig'` | Ejecutar `npm install` de nuevo |
| Pantalla en blanco tras build | Revisar consola del navegador; verificar que `VITE_API_BASE_URL` exista en el entorno de despliegue |

---

## 🤝 Para tu compañero (checklist)

1. Clonar repo  
2. `npm install`  
3. `cp .env.example .env` (o `Copy-Item` en Windows)  
4. Confirmar `VITE_API_BASE_URL` con el equipo  
5. `npm run dev`  
6. Probar login en `http://localhost:5173/login`  

Si algo falla, pregunta al equipo por la **URL del BFF activa** y las **credenciales de prueba**.