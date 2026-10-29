import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  type SearchSchemaInput,
} from '@tanstack/react-router';
import { get, queryClient } from './api';
import type { User, Search } from './contracts';
import {
  Layout,
  Home,
  Detail,
  Cart,
  Checkout,
  Auth,
  Profile,
  Wallets,
  Receipt,
  NotFound,
  Favorites,
} from './screens';
const root = createRootRoute({
  component: Layout,
  notFoundComponent: NotFound,
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
    sort: ['low', 'high'].includes(String(s.sort)) ? String(s.sort) : 'recent',
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
