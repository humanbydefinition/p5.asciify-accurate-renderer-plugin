import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
    build: {
        minify: true,
        lib: {
            entry: ['src/plugin/AccurateRendererPlugin.ts'],
            name: 'p5.asciify-accurate-renderer-plugin',
            fileName: (format) => `p5.asciify-accurate-renderer-plugin.${format === 'es' ? 'esm' : format}.js`,
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: ['p5', 'p5.asciify'],
            output: {
                globals: {
                    p5: 'p5',
                    'p5.asciify': 'p5.asciify',
                },
                
            },
        }
    },
    plugins: [
        glsl({ compress: true }),
    ],
});