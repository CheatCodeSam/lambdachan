/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly BACKEND_SERVER_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
