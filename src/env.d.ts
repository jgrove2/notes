/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_KINDE_CLIENT_ID: string;
  readonly VITE_KINDE_DOMAIN: string;
  readonly VITE_KINDE_REDIRECT_URI: string;
  readonly VITE_KINDE_LOGOUT_URI: string;
  readonly VITE_UPLOADTHING_URL: string;
  readonly VITE_MAX_IMAGE_SIZE: number;
  readonly UPLOADTHING_TOKEN: string;
  readonly AUTH_SECRET: string;
  readonly VITE_API_BASE_URL: string;
  readonly NODE_ENV: "development" | "production" | "test";
  // Add other VITE_ prefixed variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
