import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Minimal test config, kept apart from vite.config.js so the dev-server
// plugins (visual editor, iframe route restoration) never load under test.
// Two kinds of suite run here:
//   src/**/*.test.js, tools/**/*.test.js      the app's own tests
//   packages/engines/__tests__/**/*.test.js   the vendored engine gates,
//                                            unchanged canonical jest-style
//                                            files, hence globals: true
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.{js,jsx}', 'tools/**/*.test.js', 'packages/engines/__tests__/**/*.test.js'],
  },
});
