/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del BFF, p. ej. http://13.222.88.101/api */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
