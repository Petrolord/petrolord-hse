import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Minimal test config, kept apart from vite.config.js so the dev-server
// plugins (visual editor, iframe route restoration) never load under test.
// Two kinds of suite run here:
//   src/**/*.test.js, tools/**/*.test.js      the app's own tests
//   (a file that needs a DOM opts in with `// @vitest-environment jsdom`,
//   as the design-system theme tests do)
//   packages/engines/__tests__/**/*.test.js   the vendored engine gates,
//                                            unchanged canonical jest-style
//                                            files, hence globals: true
export default defineConfig({
  // The app builds JSX with the automatic runtime (@vitejs/plugin-react), so
  // some components never import React; the tests compile JSX the same way.
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.{js,jsx}', 'tools/**/*.test.js', 'packages/engines/__tests__/**/*.test.js'],
  },
});
