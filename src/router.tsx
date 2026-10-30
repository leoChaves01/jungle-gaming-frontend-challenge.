import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
  type SearchSchemaInput,
} from '@tanstack/react-router';
import { get, queryClient } from './api';
import type { Search, User } from './contracts';
import { Detail, Home, Layout, NotFound } from './screens';
const Cart = lazyRouteComponent(() => import('./purchase'), 'Cart');
const Checkout = lazyRouteComponent(() => import('./purchase'), 'Checkout');
const Receipt = lazyRouteComponent(() => import('./purchase'), 'Receipt');
const Auth = lazyRouteComponent(() => import('./account'), 'Auth');
const Profile = lazyRouteComponent(() => import('./account'), 'Profile');
const Wallets = lazyRouteComponent(() => import('./account'), 'Wallets');
const Favorites = lazyRouteComponent(() => import('./account'), 'Favorites');
const root = createRootRoute({
  component: Layout,
  notFoundComponent: NotFound,
  errorComponent: () => (
    <main className="empty" role="alert">
      <h1>Não foi possível abrir esta página</h1>
      <p>Recarregue para reconectar à demonstração. Seus dados locais serão preservados.</p>
      <button className="primary-link" onClick={() => location.reload()}>
        Recarregar página
      </button>
    </main>
  ),
});
const protect = async () => {
  const session = await queryClient.fetchQuery({
    queryKey: ['session'],
    queryFn: () => get<User | null>('/session'),
    staleTime: 0,
  });
  if (!session)
    throw redirect({
      to: '/login',
      search: { returnTo: location.pathname + location.search },
    });
};
const home = createRoute({
  getParentRoute: () => root,
  path: '/',
  validateSearch: (s: Record<string, unknown> & SearchSchemaInput): Search => ({
    q: String(s.q || ''),
    category: String(s.category || ''),
    network: String(s.network || ''),
    sort: ['low', 'high', 'new', 'popular'].includes(String(s.sort)) ? String(s.sort) : 'recent',
    page: Math.max(1, Math.floor(Number(s.page) || 1)),
    min: /^\d+(\.\d{1,18})?$/.test(String(s.min)) ? String(s.min) : '',
    max: /^\d+(\.\d{1,18})?$/.test(String(s.max)) ? String(s.max) : '',
  }),
  component: Home,
});
const detail = createRoute({
  getParentRoute: () => root,
  path: '/nft/$id',
  component: Detail,
});
const cart = createRoute({
  getParentRoute: () => root,
  path: '/cart',
  component: Cart,
});
const checkout = createRoute({
  getParentRoute: () => root,
  path: '/checkout',
  beforeLoad: protect,
  component: Checkout,
});
const login = createRoute({
  getParentRoute: () => root,
  path: '/login',
  validateSearch: (s: Record<string, unknown> & SearchSchemaInput) => ({
    returnTo:
      typeof s.returnTo === 'string' && s.returnTo.startsWith('/') && !s.returnTo.startsWith('//')
        ? s.returnTo
        : '/',
  }),
  component: () => <Auth />,
});
const register = createRoute({
  getParentRoute: () => root,
  path: '/register',
  component: () => <Auth register />,
});
const profile = createRoute({
  getParentRoute: () => root,
  path: '/profile',
  beforeLoad: protect,
  component: Profile,
});
const wallets = createRoute({
  getParentRoute: () => root,
  path: '/wallets',
  beforeLoad: protect,
  component: Wallets,
});
const favorites = createRoute({
  getParentRoute: () => root,
  path: '/favorites',
  beforeLoad: protect,
  component: Favorites,
});
const receipt = createRoute({
  getParentRoute: () => root,
  path: '/order/$id',
  beforeLoad: protect,
  component: Receipt,
});
export const router = createRouter({
  routeTree: root.addChildren([
    home,
    detail,
    cart,
    checkout,
    login,
    register,
    profile,
    wallets,
    favorites,
    receipt,
  ]),
  defaultPreload: 'intent',
  defaultPendingComponent: () => <div className="skeleton" aria-label="Carregando página" />,
});
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
