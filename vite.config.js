import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: { target: "esnext" },
  },
  build: {
    target: "esnext",
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "TopoHelper",
      // the proper extensions will be added
      fileName: "topohelper",
    },
  },
});
