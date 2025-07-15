/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SSE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
