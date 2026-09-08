import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = !!process.env["VERCEL"];

export default defineConfig({
  nitro: isVercel
    ? {
        preset: "vercel",
      }
    : true,

  vite: {
    server: {
      host: "0.0.0.0",
      port: 8082,
      strictPort: false,
    },
  },

  tanstackStart: {
    server: {
      entry: "server",
    },
  },
});