import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './src/main.ts',
  outDir: './dist',
  tsconfig: './tsconfig.json',
  dts: false,
  platform: 'node',
  format: ['esm'],
  clean: false,
  external: [
    'better-sqlite3',
    'drizzle-orm',
    'drizzle-orm/better-sqlite3',
    'hono',
    'hono/cors',
    '@hono/node-server',
    'p-queue',
  ],
  sourcemap: true,
});
