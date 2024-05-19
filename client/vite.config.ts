import { defineConfig } from 'vite';
import path from "path";
import react from '@vitejs/plugin-react-swc'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
    build: {
        outDir: './dist',
    },
    plugins: [
        react(),
        commonjs(),
    ],
    server: {
        port: 3000,
    },
    resolve: {
        preserveSymlinks: true,
        alias: {
            '@coolgedon': path.join(__dirname, 'node_modules', '@coolgedon'),
            Component: path.join(__dirname, 'src', 'components'),
            Image: path.join(__dirname, 'src', 'imgs'),
            Type: path.join(__dirname, 'src', 'types'),
            Store: path.join(__dirname, 'src', 'stores'),
            Service: path.join(__dirname, 'src', 'services'),
            Hook: path.join(__dirname, 'src', 'hooks'),
            Helpers: path.join(__dirname, 'src', 'helpers.ts'),
        },
    },
});
