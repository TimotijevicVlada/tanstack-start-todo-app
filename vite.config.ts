import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import checker from 'vite-plugin-checker'

const config = defineConfig({
  plugins: [
    devtools(),
    netlify(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    checker({
      typescript: {
        root: process.cwd(),
        tsconfigPath: 'tsconfig.app.json',
      },
      eslint: {
        lintCommand:
          'eslint "./src/**/*.{ts,tsx}" --no-eslintrc --config eslint.config.js',
        useFlatConfig: true,
      },
    }),
  ],
  server: {
    open: true,
    port: 3000,
  },
})

export default config
