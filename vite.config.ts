import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [svgr(), tsconfigPaths()],
    exclude: ['stats.js'],
    define: {
      __APP_ENV__: env.APP_ENV,
    },
  };
});
