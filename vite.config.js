import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'TopoHelper',
      // the proper extensions will be added
      fileName: 'topohelper'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['arquero'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          arquero: 'aq'
        }
      }
    }
  }
})