console.error(process.env)
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import wails from "@wailsio/runtime/plugins/vite";

// import { htmlInjectionPlugin } from 'vite-plugin-html-injection'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.DEPLOY_BASE,
  // root: "./frontend",
  plugins: [
    wails("bindings"),
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./frontend/src', import.meta.url)),
    },
  },
  server: {
    port: 9245
  }
})
