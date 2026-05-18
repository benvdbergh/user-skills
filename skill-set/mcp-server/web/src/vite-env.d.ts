/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IDE_LINK_SCHEME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}