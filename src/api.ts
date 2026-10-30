import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';
export const api = axios.create({ baseURL: '/api', timeout: 5000 });
let sessionEpoch = 0;
api.interceptors.request.use((config) => {
  config.headers.set('X-Session-Epoch', String(sessionEpoch));
  return config;
});
export async function beginSessionTransition() {
  sessionEpoch++;
  await queryClient.cancelQueries();
  queryClient.clear();
}
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000,
      retry: (count, error) =>
        axios.isAxiosError(error) && error.response?.status === 401 ? false : count < 1,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});
export const get = <T>(url: string, signal?: AbortSignal) =>
  api.get<T>(url, { signal }).then((r) => r.data);
export const post = <T>(url: string, data: unknown) => api.post<T>(url, data).then((r) => r.data);
export const message = (error: unknown) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'A resposta demorou. Tente novamente com segurança.'
        : 'Sem conexão. Tente novamente.')
    : error instanceof Error
      ? error.message
      : 'Ocorreu um erro.';
api.interceptors.response.use(
  (r) => {
    // A SPA fallback can return index.html with status 200 when the worker
    // is no longer controlling a suspended tab. Never cache it as API data.
    if (!String(r.headers['content-type']).includes('application/json')) {
      throw new Error('A conexão com a API foi interrompida. Recarregue a página para reconectar.');
    }
    if (r.config.url === '/cart' && !Array.isArray(r.data?.lines)) {
      throw new Error('Não foi possível carregar o carrinho. Tente novamente.');
    }
    return r;
  },
  (e) => {
    if (
      e.response?.status === 401 &&
      e.config?.headers?.get('X-Session-Epoch') === String(sessionEpoch) &&
      !['/login', '/register'].includes(e.config.url)
    ) {
      sessionEpoch++;
      void queryClient.cancelQueries().then(() => queryClient.clear());
      window.dispatchEvent(new Event('session-expired'));
    }
    return Promise.reject(e);
  },
);
