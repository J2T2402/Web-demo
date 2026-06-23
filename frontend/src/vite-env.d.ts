/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL của API backend. Để trống = cùng origin (production gộp FE+BE, hoặc dev qua proxy Vite). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
