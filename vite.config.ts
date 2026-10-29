import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
