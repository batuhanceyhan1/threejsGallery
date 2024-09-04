/** @type {import('vite').UserConfig} */
export default {
    build: {
        rollupOptions: {
            input: "creative.js", output: {
                manualChunks: {
                    three: ['three']
                },
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
            }
        }
    },
}