import { defineConfig, type Connect } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import compression from 'compression';
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'compressed-preview',
      configurePreviewServer(server) {
        // Serve the same complete assets with standard HTTP compression for
        // every preview client, matching a production static host.
        // The package supports Node HTTP; its DefinitelyTyped signature is Express-only.
        server.middlewares.use(compression() as unknown as Connect.NextHandleFunction);
      },
    },
    {
      name: 'preload-demo-network',
      transformIndexHtml: {
        order: 'post',
        handler(_html, context) {
          if (process.env.VITE_MOCKS === 'false') return [];
          const mock = Object.values(context.bundle || {}).find(
            (output) => output.type === 'chunk' && output.name === 'browser',
          );
          return mock
            ? [
                {
                  tag: 'link',
                  attrs: { rel: 'modulepreload', href: '/' + mock.fileName },
                  injectTo: 'head' as const,
                },
              ]
            : [];
        },
      },
    },
  ],
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
