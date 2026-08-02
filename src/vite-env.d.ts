/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Set to "true" to enable Bloom Analytics (weekly + monthly insights + quest recommendations) */
  readonly VITE_FEATURE_BLOOM_ANALYTICS?: string;
  /** Set to "false" to disable XAI explain-block (defaults on when Bloom Analytics is on) */
  readonly VITE_FEATURE_INSIGHTS_XAI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}
