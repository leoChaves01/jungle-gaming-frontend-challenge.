import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from './api';
import { router } from './router';
import './styles.css';
async function boot() {
  if (import.meta.env.VITE_MOCKS !== 'false') {
    const { startMocks } = await import('./mocks/browser');
    await startMocks();
  }
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
void boot();
