import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Link,
  Outlet,
  useNavigate,
  useParams,
  useRouterState,
  useSearch,
} from '@tanstack/react-router';
import {
  ArrowUpRight,
  Heart,
  House,
  Menu,
  Search as SearchIcon,
  ShoppingBag,
  SlidersHorizontal,
  UserRound,
  ShieldCheck,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { beginSessionTransition, get, message, post, queryClient } from './api';
import { Button } from './components/ui/button';
import type { NFT, Quote, Search, User } from './contracts';
import { useRealtime } from './realtime';
import { Editorial, ReferenceFooter } from './editorial';
const MenuDrawer = lazy(() => import('./menu-drawer'));
export const useSession = () =>
  useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => get<User | null>('/session', signal),
  });
export const useCart = () => {
  const { data: user } = useSession();
  return useQuery({
    queryKey: ['cart', user?.id || 'guest'],
    queryFn: ({ signal }) => get<Quote>('/cart', signal),
  });
};
export function Skeleton({ cards = false, detail = false }: { cards?: boolean; detail?: boolean }) {
  if (detail)
    return (
      <div role="status" aria-label="Carregando" className="detail-loading">
        <div className="loading-breadcrumb" />
        <div className="detail-grid">
          <div className="skeleton loading-gallery" />
          <div className="skeleton loading-info" />
        </div>
      </div>
    );
  return (
    <div aria-label="Carregando" role="status" className={cards ? 'cards' : ''}>
      {Array.from({ length: cards ? 9 : 1 }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}
export function ErrorBox({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="error" role="alert">
      {message(error)}{' '}
      {retry && (
        <Button variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
export function Field({ label, ...props }: React.ComponentProps<'input'> & { label: string }) {
  const id = useId();
  const [validation, setValidation] = useState('');
  return (
    <label className="field">
      <span>{label}</span>
      <input
        aria-label={label}
        {...props}
        aria-invalid={validation ? true : props['aria-invalid']}
        aria-describedby={validation ? id : props['aria-describedby']}
        onInvalid={(event) => {
          setValidation(event.currentTarget.validationMessage);
          props.onInvalid?.(event);
        }}
        onInput={(event) => {
          setValidation('');
          props.onInput?.(event);
        }}
      />
      {validation && (
        <span id={id} role="alert">
          {validation}
        </span>
      )}
    </label>
  );
}
export function Select({
  label,
  children,
  ...props
}: React.ComponentProps<'select'> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select aria-label={label} {...props}>
        {children}
      </select>
    </label>
  );
}
export function Head({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="page-heading">
      <p className="eyebrow">KURIO MARKETPLACE</p>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
function Navigation({ close }: { close?: () => void }) {
  return (
    <>
      <Link to="/" onClick={close}>
        Explorar
      </Link>
      <Link to="/favorites" onClick={close}>
        Favoritos
      </Link>
      <Link to="/wallets" onClick={close}>
        Carteiras
      </Link>
      <Link to="/profile" onClick={close}>
        Minha conta
      </Link>
    </>
  );
}
export function Layout() {
  const { data: user } = useSession();
  const cart = useCart();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const notice = useRealtime(user?.id);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const searchString = useRouterState({ select: (s) => s.location.searchStr });
  const showEvaluationPanel = new URLSearchParams(searchString).get('demo') === '1';
  useEffect(() => {
    if (user === null && /^\/(checkout|profile|wallets|favorites|order)(\/|$)/.test(path)) {
      void navigate({ to: '/login', search: { returnTo: location.pathname + location.search } });
    }
  }, [user, path, navigate]);
  useEffect(() => {
    const expire = () => {
      if (location.pathname === '/login') return;
      void navigate({
        to: '/login',
        search: { returnTo: location.pathname + location.search },
      });
    };
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, [navigate]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);
  const logout = useMutation({
    mutationFn: async () => {
      await beginSessionTransition();
      return post('/logout', {});
    },
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await navigate({ to: '/' });
    },
  });
  return (
    <>
      <a href="#main" className="skip">
        Pular para conteúdo
      </a>
      <div className="demo-banner">
        Uma nova forma de colecionar. <span>Ambiente demonstrativo • sem pagamentos reais</span>
      </div>
      <header>
        <Link to="/" className="logo">
          <span className="logo-symbol">G</span> Kurio
          <span className="logo-dot">®</span>
        </Link>
        <nav aria-label="Principal" className="desktop-nav">
          <Link to="/" activeOptions={{ exact: true }}>
            Início
          </Link>
          <Link to="/" hash="catalog">
            Mercado
          </Link>
          <Link to="/" hash="creators">
            Criadores
          </Link>
          <Link to="/" hash="journal">
            Aprenda
          </Link>
        </nav>
        <div className="header-actions">
          <Link to="/" hash="market-search" aria-label="Abrir busca" className="header-search">
            <SearchIcon size={20} />
          </Link>
          <Link
            to="/cart"
            aria-label={`Carrinho (${cart.data?.lines?.reduce((n, l) => n + l.quantity, 0) || 0})`}
            className="cart-link"
          >
            <ShoppingBag size={20} />
            <span aria-hidden="true">
              {cart.data?.lines?.reduce((n, l) => n + l.quantity, 0) || 0}
            </span>
          </Link>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => logout.mutate()}>
              Sair
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Entrar</Link>
            </Button>
          )}
          <Button
            ref={menuTrigger}
            variant="ghost"
            className="mobile-menu"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
            aria-expanded={menu}
            onClick={() => setMenu(true)}
          >
            <Menu />
          </Button>
          {menu && (
            <Suspense fallback={<span role="status">Abrindo menu…</span>}>
              <MenuDrawer onClose={() => setMenu(false)} trigger={menuTrigger}>
                <Navigation close={() => setMenu(false)} />
              </MenuDrawer>
            </Suspense>
          )}
        </div>
      </header>
      {cart.error && (
        <div className="api-notice">
          <ErrorBox error={cart.error} retry={() => void cart.refetch()} />
        </div>
      )}
      {notice && (
        <div className="live-notice" role="status">
          {notice}
        </div>
      )}
      <main id="main" tabIndex={-1} className={path === '/' ? 'home-page' : ''}>
        <Outlet />
      </main>
      <ReferenceFooter />
      {showEvaluationPanel && <DemoPanel />}
      <nav className="bottom-nav" aria-label="Navegação mobile">
        <Link to="/" aria-label="Início">
          <House />
        </Link>
        <Link to="/favorites" aria-label="Meus favoritos">
          <Heart />
        </Link>
        <Link to="/cart" aria-label="Abrir carrinho">
          <ShoppingBag />
        </Link>
        <Link to="/profile" aria-label="Abrir perfil">
          <UserRound />
        </Link>
      </nav>
    </>
  );
}
function DemoPanel() {
  const [scenario, setScenario] = useState('normal');
  const [info, setInfo] = useState('');
  const run = useMutation({
    mutationFn: async (action: string) => {
      if (action === 'scenario') await post('/demo', { scenario });
      else if (action === 'reset') await post('/demo/reset', {});
      else await post('/demo/event', { action, id: '1' });
      return action;
    },
    onSuccess: (action) => {
      setInfo('Cenário atualizado.');
      if (action === 'reset') location.assign('/');
      else if (action === 'scenario') void queryClient.invalidateQueries();
    },
  });
  return (
    <details className="demo-panel">
      <summary>Laboratório de demonstração</summary>
      <p>Controles reproduzíveis dos mocks. Alterações de NFT são enviadas por Socket.IO.</p>
      <Select label="Cenário" value={scenario} onChange={(e) => setScenario(e.target.value)}>
        {[
          'normal',
          'slow',
          'race',
          'offline',
          'server-error',
          'invalid-response',
          'expired',
          'favorite-error',
          'declined',
          'timeout',
          'pending',
        ].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </Select>
      <div className="actions">
        <Button onClick={() => run.mutate('scenario')}>Aplicar cenário</Button>
        <Button onClick={() => run.mutate('price')}>Alterar preço NFT 1</Button>
        <Button onClick={() => run.mutate('stock')}>Esgotar NFT 1</Button>
        <Button onClick={() => run.mutate('duplicate')}>Duplicar evento</Button>
        <Button onClick={() => run.mutate('disconnect')}>Interromper conexão</Button>
        <Button variant="outline" onClick={() => run.mutate('reset')}>
          Resetar demonstração
        </Button>
      </div>
      <p role="status">{info}</p>
    </details>
  );
}
export function Card({ nft, priority = false }: { nft: NFT; priority?: boolean }) {
  return (
    <article className="nft-card">
      <Link to="/nft/$id" params={{ id: nft.id }}>
        <div className="art-wrap">
          <img
            src={nft.image}
            srcSet={`${nft.image.replace('.webp', '-small.webp')} 320w, ${nft.image} 640w`}
            sizes="(max-width: 560px) 45vw, (max-width: 1000px) 30vw, 280px"
            width="400"
            height="400"
            alt={`${nft.name}, arte de ${nft.artist}`}
            loading={priority ? 'eager' : 'lazy'}
          />
          {nft.id === '3' && <span className="art-tag">RARO</span>}
        </div>
        <div className="card-info">
          <p className="muted">
            {nft.artist} <span className="verified">✓</span>
          </p>
          <h3>{nft.name}</h3>
          <div className="card-bottom">
            <span>
              <small>Preço</small>
              <strong>{nft.price} ETH</strong>
            </span>
            <span className="round-arrow">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
export function Home() {
  const params = useSearch({ strict: false });
  const search: Search = {
    q: '',
    category: '',
    network: '',
    sort: 'recent',
    page: 1,
    min: '',
    max: '',
    ...params,
  };
  const navigate = useNavigate();
  const [text, setText] = useState(search.q);
  // On a direct URL or reload, selected filters must remain operable on mobile.
  // Keeping this panel open also avoids hiding the active state while catalog data reloads.
  const [filtersOpen, setFiltersOpen] = useState(
    () => Boolean(search.category || search.network || search.min || search.max),
  );
  const filtersHaveSelection = Boolean(search.category || search.network || search.min || search.max);
  const filtersVisible = filtersOpen || filtersHaveSelection;
  const [range, setRange] = useState({ min: search.min || '0', max: search.max || '12.3' });
  useEffect(
    () => setRange({ min: search.min || '0', max: search.max || '12.3' }),
    [search.min, search.max],
  );
  useEffect(() => setText(search.q), [search.q]);
  const update = (next: Partial<Search>) =>
    void navigate({
      to: '/',
      search: { ...search, ...next, page: next.page ?? 1 },
    });
  const catalog = useQuery({
    queryKey: ['nfts', search],
    queryFn: ({ signal }) =>
      get<{
        items: NFT[];
        total: number;
        categories: Record<string, number>;
        networks: Record<string, number>;
      }>(
        '/nfts?' + new URLSearchParams(Object.entries(search).map(([k, v]) => [k, String(v)])),
        signal,
      ),
  });
  return (
    <>
      <form
        id="market-search"
        className="market-search"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: text });
        }}
      >
        <SearchIcon aria-hidden="true" size={20} />
        <input
          aria-label="Buscar NFTs"
          placeholder="Explorar coleções"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" variant="ghost" size="sm">
          Buscar
        </Button>
        <Button
          type="button"
          className="filter-toggle"
          aria-label="Filtros"
          aria-expanded={filtersVisible}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen(!filtersVisible)}
        >
          <SlidersHorizontal />
        </Button>
      </form>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Bem-vindo à Kurio</p>
          <h1>
            SEJA DONO DO FUTURO
            <br />
            DA <em>ARTE DIGITAL</em>
          </h1>
          <p className="hero-description-long">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            <br />
            Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
          </p>
          <p className="hero-description-short">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <a className="primary-link" href="#catalog">
            Explorar coleção <ArrowUpRight size={18} />
          </a>
          <div className="hero-stats">
            <span>
              <strong>36+</strong>Obras exclusivas
            </span>
            <span>
              <strong>4</strong>Coleções
            </span>
            <span>
              <strong>2</strong>Redes
            </span>
          </div>
        </div>
        <Link className="hero-art" to="/nft/$id" params={{ id: '1' }}>
          <img
            src="/art/emerald.webp"
            alt="Emerald Ape, destaque da coleção"
            width="520"
            height="520"
            fetchPriority="high"
          />
          <div className="hero-caption">
            <span>
              <small>COLEÇÃO EM DESTAQUE</small>
              <strong>Emerald Ape #042</strong>
            </span>
            <ArrowUpRight />
          </div>
        </Link>
        <span className="hero-dots" aria-hidden="true">
          ● ● ●
        </span>
      </section>
      <section id="catalog" className="catalog">
        <div className="section-title">
          <div>
            <p className="eyebrow">ENCONTRE SUA PRÓXIMA PEÇA</p>
            <h2>Explore o marketplace</h2>
          </div>
          <span className="muted">Arte que conecta.</span>
        </div>
        <div className="catalog-layout">
          <aside id="catalog-filters" className={`filters ${filtersVisible ? 'filters-open' : ''}`}>
            <h3>Coleções</h3>
            <div className="filter-links" aria-label="Coleções">
              {[
                ['Arte', 33],
                ['Fotografia', 12],
                ['Música', 65],
                ['Arte 3D', 39],
                ['Colecionáveis', 23],
                ['Generativa', 17],
                ['Gaming', 19],
                ['Assinaturas', 13],
                ['Utilidade', 18],
              ].map(([category, count]) => (
                <button
                  key={String(category)}
                  aria-pressed={search.category === String(category)}
                  onClick={() =>
                    update({
                      category: search.category === String(category) ? '' : String(category),
                    })
                  }
                >
                  {category === 'Arte'
                    ? 'Arte digital'
                    : category === 'Gaming'
                      ? 'Jogos'
                      : category}
                  <span>({count})</span>
                </button>
              ))}
            </div>
            <h3>Faixa de preço</h3>
            <div className="price-range">
              <input
                type="range"
                aria-label="Ajustar preço mínimo"
                min="0"
                max="12.3"
                step="0.01"
                value={range.min}
                onChange={(e) =>
                  setRange({
                    ...range,
                    min: String(Math.min(Number(e.target.value), Number(range.max))),
                  })
                }
              />
              <input
                type="range"
                aria-label="Ajustar preço máximo"
                min="0"
                max="12.3"
                step="0.01"
                value={range.max}
                onChange={(e) =>
                  setRange({
                    ...range,
                    max: String(Math.max(Number(e.target.value), Number(range.min))),
                  })
                }
              />
              <p>
                Preço: {range.min} – {range.max} ETH
              </p>
              <Button onClick={() => update({ min: range.min, max: range.max })}>Aplicar</Button>
            </div>
            <details className="precise-prices">
              <summary>Valores exatos</summary>
              <Button
                variant="ghost"
                onClick={() => {
                  setText('');
                  update({ q: '', category: '', network: '', sort: 'recent', min: '', max: '' });
                }}
              >
                Limpar filtros
              </Button>
              <Field
                label="Preço mínimo (ETH)"
                type="number"
                min="0"
                step="0.0001"
                value={search.min}
                onChange={(e) => update({ min: e.target.value })}
              />
              <Field
                label="Preço máximo (ETH)"
                type="number"
                min="0"
                step="0.0001"
                value={search.max}
                onChange={(e) => update({ max: e.target.value })}
              />
            </details>
            <h3>Rede</h3>
            <div className="filter-links">
              {[
                ['Ethereum', 119],
                ['Polygon', 78],
                ['Solana', 86],
              ].map(([network, count]) => (
                <button
                  key={String(network)}
                  aria-pressed={search.network === String(network)}
                  onClick={() =>
                    update({ network: search.network === String(network) ? '' : String(network) })
                  }
                >
                  {network}
                  <span>({count})</span>
                </button>
              ))}
            </div>
            <Link className="featured-nft" to="/nft/$id" params={{ id: '2' }}>
              <h3>NFT EM DESTAQUE</h3>
              <strong>OFERTA LIMITADA</strong>
              <img
                src="/art/sage-small.webp"
                width="320"
                height="320"
                alt="Sage Nomad em destaque"
                loading="lazy"
              />
            </Link>
          </aside>
          <div>
            <div className="collection-tabs" aria-label="Ordenação rápida">
              <button
                type="button"
                aria-pressed={search.sort === 'recent'}
                onClick={() => update({ sort: 'recent' })}
              >
                Todos os NFTs
              </button>
              <button
                type="button"
                aria-pressed={search.sort === 'new'}
                onClick={() => update({ sort: 'new' })}
              >
                Novos lançamentos
              </button>
              <button
                type="button"
                aria-pressed={search.sort === 'popular'}
                onClick={() => update({ sort: 'popular' })}
              >
                Em alta
              </button>
            </div>
            <div className="catalog-toolbar">
              <p role="status">
                {catalog.data?.total ?? '…'} NFTs disponíveis{' '}
                {catalog.isFetching && !catalog.isPending && '• Atualizando'}
              </p>
              <Select
                label="Ordenar por"
                value={search.sort}
                onChange={(e) => update({ sort: e.target.value })}
              >
                <option value="recent">Listados recentemente</option>
                <option value="new">Novos lançamentos</option>
                <option value="popular">Em alta</option>
                <option value="low">Menor preço</option>
                <option value="high">Maior preço</option>
              </Select>
            </div>
            {catalog.isPending ? (
              <Skeleton cards />
            ) : catalog.error ? (
              <ErrorBox error={catalog.error} retry={() => void catalog.refetch()} />
            ) : catalog.data.items.length ? (
              <div className="cards">
                {catalog.data.items.map((n, index) => (
                  <Card nft={n} key={n.id} priority={index < 3} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>Nenhum NFT encontrado</h3>
                <p>Tente outra busca ou remova os filtros.</p>
              </div>
            )}
            <nav className="pagination" aria-label="Paginação">
              <Button
                variant="outline"
                disabled={search.page === 1}
                onClick={() => update({ page: search.page - 1 })}
              >
                Anterior
              </Button>
              <span>Página {search.page}</span>
              <Button
                variant="outline"
                disabled={!catalog.data || search.page * 9 >= catalog.data.total}
                onClick={() => update({ page: search.page + 1 })}
              >
                Próxima
              </Button>
            </nav>
          </div>
        </div>
      </section>
      <Editorial />
    </>
  );
}
function Favorite({ id }: { id: string }) {
  const { data: user } = useSession();
  const navigate = useNavigate();
  const key = ['favorites', user?.id];
  const favorites = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => get<string[]>('/favorites', signal),
    enabled: !!user,
  });
  const mutation = useMutation({
    mutationFn: (active: boolean) => post<string[]>('/favorites', { id, active }),
    onMutate: async (active) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key) || [];
      queryClient.setQueryData(key, active ? [...previous, id] : previous.filter((x) => x !== id));
      return { previous };
    },
    onError: (_e, _v, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  return (
    <>
      <Button
        variant="outline"
        aria-label="Favoritar NFT"
        aria-pressed={favorites.data?.includes(id) || false}
        disabled={mutation.isPending}
        onClick={() =>
          user
            ? mutation.mutate(!favorites.data?.includes(id))
            : void navigate({
                to: '/login',
                search: { returnTo: location.pathname },
              })
        }
      >
        <Heart size={18} fill={favorites.data?.includes(id) ? 'currentColor' : 'none'} />
        Favorito
      </Button>
      {mutation.error && <ErrorBox error={mutation.error} />}
      <span role="status" className="muted">
        {mutation.isPending
          ? 'Salvando favorito…'
          : mutation.isSuccess
            ? 'Favoritos atualizados.'
            : ''}
      </span>
    </>
  );
}
export function Detail() {
  const { id } = useParams({ from: '/nft/$id' });
  const nft = useQuery({
    queryKey: ['nft', id],
    queryFn: ({ signal }) => get<NFT>('/nfts/' + id, signal),
  });
  const related = useQuery({
    queryKey: ['nfts', 'related'],
    queryFn: ({ signal }) =>
      get<{
        items: NFT[];
        total: number;
        categories: Record<string, number>;
        networks: Record<string, number>;
      }>('/nfts?page=1', signal),
  });
  const cart = useCart();
  const [edition, setEdition] = useState('standard'),
    [quantity, setQuantity] = useState(1),
    [added, setAdded] = useState(false),
    [gallery, setGallery] = useState(0);
  const add = useMutation({
    mutationFn: () => {
      const current =
        cart.data?.lines.find((l) => l.nftId === id && l.edition === edition)?.quantity || 0;
      return post('/cart', {
        nftId: id,
        edition,
        quantity: current + quantity,
      });
    },
    onSuccess: () => {
      setAdded(true);
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
  if (nft.isPending) return <Skeleton detail />;
  if (nft.error) return <ErrorBox error={nft.error} retry={() => void nft.refetch()} />;
  const n = nft.data,
    stock = n.editions.find((e) => e.id === edition)?.stock || 0;
  return (
    <>
      <div className="breadcrumbs">
        <Link to="/">Marketplace</Link>
        <span>/</span>
        {n.name}
      </div>
      <div className="detail-grid">
        <section className="gallery">
          <img
            className={gallery ? 'art-detail closeup' : 'art-detail'}
            fetchPriority="high"
            src={n.image}
            width="640"
            height="640"
            alt={n.name}
          />
          <div className="thumbnails">
            {[0, 1].map((v) => (
              <button
                key={v}
                aria-label={v ? 'Ver detalhe da arte' : 'Ver arte completa'}
                aria-pressed={v === gallery}
                onClick={() => setGallery(v)}
              >
                <img src={n.image} alt="" width="72" height="72" />
              </button>
            ))}
          </div>
        </section>
        <section className="detail-info">
          <p className="eyebrow">
            {n.category} · {n.network}
          </p>
          <h1>{n.name}</h1>
          <p className="creator">
            Criado por <strong>{n.artist}</strong> <span className="verified">✓</span>
          </p>
          <p className="description">
            Uma expressão original da cultura digital. Cores, personalidade e uma história para
            fazer parte da sua coleção.
          </p>
          <div className="price-box">
            <small>Preço por unidade</small>
            <strong>
              {n.price} <span>ETH</span>
            </strong>
            <p>{stock ? `${stock} unidades disponíveis` : 'Edição esgotada'}</p>
          </div>
          <div className="two-fields">
            <Select
              label="Edição"
              value={edition}
              onChange={(e) => {
                setEdition(e.target.value);
                setQuantity(1);
              }}
            >
              {n.editions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {!e.stock ? ' — indisponível' : ''}
                </option>
              ))}
            </Select>
            <Field
              label="Quantidade"
              type="number"
              min="1"
              max={stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="actions">
            <Button
              disabled={
                add.isPending || quantity < 1 || !Number.isInteger(quantity) || quantity > stock
              }
              onClick={() => add.mutate()}
            >
              <ShoppingBag size={18} />
              Adicionar ao carrinho
            </Button>
            <Favorite id={id} />
          </div>
          {add.error && <ErrorBox error={add.error} />}
          <p role="status">
            {added && (
              <>
                NFT adicionado. <Link to="/cart">Ver carrinho →</Link>
              </>
            )}
          </p>
          <details className="info-details">
            <summary>Detalhes da coleção</summary>
            <p>
              Rede: {n.network}
              <br />
              Categoria: {n.category}
              <br />
              Identificador: #{n.id}
            </p>
          </details>
        </section>
      </div>
      <section className="detail-description">
        <h2>Sobre esta obra</h2>
        <p>
          Encontre novas perspectivas através da arte digital. Esta peça integra a coleção de{' '}
          {n.artist} no Kurio.
        </p>
      </section>
      <section className="related-collection">
        <h2>Mais desta coleção</h2>
        {related.isPending ? (
          <Skeleton cards />
        ) : related.error ? (
          <ErrorBox error={related.error} retry={() => void related.refetch()} />
        ) : (
          <div className="cards">
            {related.data.items
              .filter((item) => item.id !== id)
              .slice(0, 5)
              .map((item) => (
                <Card key={item.id} nft={item} />
              ))}
          </div>
        )}
      </section>
    </>
  );
}
export function Summary({ quote, children }: { quote: Quote; children?: ReactNode }) {
  return (
    <aside className="summary">
      <h2>Resumo do pedido</h2>
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{quote.subtotal} ETH</dd>
        </div>
        <div>
          <dt>Desconto {quote.coupon && `(${quote.coupon})`}</dt>
          <dd>−{quote.discount} ETH</dd>
        </div>
        <div>
          <dt>Taxa de rede</dt>
          <dd>{quote.fee} ETH</dd>
        </div>
        <div className="total">
          <dt>Total</dt>
          <dd data-testid="total">{quote.total} ETH</dd>
        </div>
      </dl>
      {children}
      <p className="secure">
        <ShieldCheck size={16} /> Transação 100% simulada
      </p>
    </aside>
  );
}
export function NotFound() {
  return (
    <div className="empty">
      <Head title="Página não encontrada" />
      <Button asChild>
        <Link to="/">Voltar ao marketplace</Link>
      </Button>
    </div>
  );
}
