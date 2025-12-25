/// <reference types="vite/client" />

// Zaraz (Cloudflare Analytics) types
declare global {
  interface Window {
    zaraz?: {
      track: (eventName: string, properties?: Record<string, any>) => void;
      set: (key: string, value: any, options?: Record<string, any>) => void;
    };
  }
}
