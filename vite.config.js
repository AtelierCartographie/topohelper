import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: { target: 'esnext' },
  },
  build: {
    target: "esnext",
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'TopoHelper',
      // the proper extensions will be added
      fileName: 'topohelper'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['arquero', 'proj4'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          arquero: 'aq',
          proj4: 'proj4'
        }
      }
    }
  }
})