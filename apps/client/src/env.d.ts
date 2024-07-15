/// <reference types="astro/client" />

interface Window {
  Alpine: import("alpinejs").Alpine
}

interface ImportMetaEnv {
  readonly BACKEND_SERVER_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
