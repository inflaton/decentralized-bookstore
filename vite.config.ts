import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import inject from '@rollup/plugin-inject'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  console.log(`command: ${command} mode: ${mode}`)
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: './',
    plugins: [vue()],
    server: {
      port: env.PORT || 3000,
    },
    resolve: {
      alias: {
        web3: 'web3/dist/web3.min.js',
      },
    },
    build: {
      chunkSizeWarningLimit: 3600,
      rollupOptions: {
        plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  }
})
