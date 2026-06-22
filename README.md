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

## 🚀 Instrucciones de Ejecución Local

Para levantar el servidor de desarrollo en tu máquina local, sigue estos sencillos pasos:

### 1. Instalar dependencias del proyecto
npm install