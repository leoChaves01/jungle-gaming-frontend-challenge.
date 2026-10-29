import { useEffect, useRef, useState, useId, type FormEvent, type ReactNode } from 'react';
import {
  Link,
  Outlet,
  useNavigate,
  useParams,
  useSearch,
  useRouterState,
} from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  ArrowUpRight,
  Wallet as WalletIcon,
  ShieldCheck,
  Layers,
  Search as SearchIcon,
  ArrowRight,
  CheckCircle2,
  House,
  UserRound,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { api, get, post, queryClient, message, beginSessionTransition } from './api';
import { useRealtime } from './realtime';
import type { NFT, User, Quote, Wallet, Order, Search } from './contracts';
const useSession = () =>
  useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => get<User | null>('/session', signal),
  });
const useCart = () => {
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
      {Array.from({ length: cards ? 8 : 1 }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}
function ErrorBox({ error, retry }: { error: unknown; retry?: () => void }) {
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
function Field({ label, ...props }: React.ComponentProps<'input'> & { label: string }) {
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
function Select({ label, children, ...props }: React.ComponentProps<'select'> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select aria-label={label} {...props}>
        {children}
      </select>
    </label>
  );
}
function Head({ title, subtitle }: { title: string; subtitle?: string }) {
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
  const notice = useRealtime(user?.id);
  const path = useRouterState({ select: (s) => s.location.pathname });
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
          <Navigation />
        </nav>
        <div className="header-actions">
          <Link
            to="/cart"
            aria-label={`Carrinho (${cart.data?.lines.reduce((n, l) => n + l.quantity, 0) || 0})`}
            className="cart-link"
          >
            <ShoppingBag size={20} />
            <span>{cart.data?.lines.reduce((n, l) => n + l.quantity, 0) || 0}</span>
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
          <Dialog.Root open={menu} onOpenChange={setMenu}>
            <Dialog.Trigger asChild>
              <Button variant="ghost" className="mobile-menu" aria-label="Abrir menu">
                <Menu />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="overlay" />
              <Dialog.Content className="dialog drawer">
                <Dialog.Title>Menu</Dialog.Title>
                <Dialog.Description>Navegue pelo marketplace.</Dialog.Description>
                <nav className="stack">
                  <Navigation close={() => setMenu(false)} />
                </nav>
                <Dialog.Close asChild>
                  <Button variant="outline" aria-label="Fechar menu">
                    <X />
                  </Button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>
      {notice && (
        <div className="live-notice" role="status">
          {notice}
        </div>
      )}
      <main id="main" tabIndex={-1} className={path === '/' ? 'home-page' : ''}>
        <Outlet />
      </main>
      <section className="benefits">
        <div>
          <ShieldCheck />
          <h3>Colecione com confiança</h3>
          <p>Transparência em cada detalhe.</p>
        </div>
        <div>
          <WalletIcon />
          <h3>Sua coleção, suas escolhas</h3>
          <p>Carteiras e redes em um só lugar.</p>
        </div>
        <div>
          <Layers />
          <h3>Descubra o extraordinário</h3>
          <p>Arte digital de novos criadores.</p>
        </div>
      </section>
      <footer>
        <div>
          <Link to="/" className="logo">
            Kurio®
          </Link>
          <p>Arte, comunidade e novas possibilidades.</p>
        </div>
        <nav aria-label="Rodapé">
          <Link to="/">Marketplace</Link>
          <Link to="/profile">Meu perfil</Link>
          <Link to="/wallets">Minhas carteiras</Link>
        </nav>
        <p>© 2026 Kurio. Projeto demonstrativo.</p>
        <DemoPanel />
      </footer>
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
function Card({ nft }: { nft: NFT }) {
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
            loading="lazy"
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
  const search = useSearch({ from: '/' });
  const navigate = useNavigate();
  const [text, setText] = useState(search.q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => setText(search.q), [search.q]);
  const update = (next: Partial<Search>) =>
    void navigate({
      to: '/',
      search: { ...search, ...next, page: next.page ?? 1 },
    });
  const catalog = useQuery({
    queryKey: ['nfts', search],
    queryFn: ({ signal }) =>
      get<{ items: NFT[]; total: number }>(
        '/nfts?' + new URLSearchParams(Object.entries(search).map(([k, v]) => [k, String(v)])),
        signal,
      ),
  });
  return (
    <>
      <form
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
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
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
              <strong>32+</strong>Obras exclusivas
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
          <aside id="catalog-filters" className={`filters ${filtersOpen ? 'filters-open' : ''}`}>
            <h3>Filtros</h3>
            <Select
              label="Categoria"
              value={search.category}
              onChange={(e) => update({ category: e.target.value })}
            >
              <option value="">Todas as categorias</option>
              {['Arte', 'Colecionáveis', 'Fotografia', 'Gaming'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select
              label="Rede"
              value={search.network}
              onChange={(e) => update({ network: e.target.value })}
            >
              <option value="">Todas as redes</option>
              <option>Ethereum</option>
              <option>Polygon</option>
            </Select>
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
                aria-pressed={search.sort === 'low'}
                onClick={() => update({ sort: 'low' })}
              >
                Menor preço
              </button>
              <button
                type="button"
                aria-pressed={search.sort === 'high'}
                onClick={() => update({ sort: 'high' })}
              >
                Maior preço
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
                <option value="recent">Mais recentes</option>
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
                {catalog.data.items.map((n) => (
                  <Card nft={n} key={n.id} />
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
                disabled={!catalog.data || search.page * 8 >= catalog.data.total}
                onClick={() => update({ page: search.page + 1 })}
              >
                Próxima
              </Button>
            </nav>
          </div>
        </div>
      </section>
      <section className="collect-banner">
        <img src="/art/emerald.webp" alt="Emerald Ape" width="180" height="180" loading="lazy" />
        <div>
          <p className="eyebrow">SUA IDENTIDADE DIGITAL</p>
          <h2>
            Uma coleção tão única
            <br />
            quanto você.
          </h2>
        </div>
        <Button asChild>
          <Link to="/register">
            Comece sua jornada <ArrowRight size={18} />
          </Link>
        </Button>
      </section>
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
    queryFn: ({ signal }) => get<{ items: NFT[]; total: number }>('/nfts?page=1', signal),
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
              <br />
              Transações demonstrativas, sem ativos reais.
            </p>
          </details>
        </section>
      </div>
      <section className="detail-description">
        <h2>Sobre esta obra</h2>
        <p>
          Encontre novas perspectivas através da arte digital. Esta peça integra a coleção de{' '}
          {n.artist} no Kurio. Todos os itens desta demonstração são simulados.
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
function Summary({ quote, children }: { quote: Quote; children?: ReactNode }) {
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
export function Cart() {
  const cart = useCart();
  const [coupon, setCoupon] = useState('');
  const update = useMutation({
    mutationFn: (item: { nftId: string; edition: string; quantity: number }) => post('/cart', item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
  const apply = useMutation({
    mutationFn: (code: string) => post('/quote', { coupon: code }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
  return (
    <>
      <Head
        title="Seu carrinho de NFTs"
        subtitle="Sua próxima coleção começa aqui. Revise seus itens antes de continuar."
      />
      {cart.isPending ? (
        <Skeleton />
      ) : cart.error ? (
        <ErrorBox error={cart.error} retry={() => void cart.refetch()} />
      ) : !cart.data.lines.length ? (
        <div className="empty">
          <ShoppingBag />
          <h2>Seu carrinho está vazio</h2>
          <Button asChild>
            <Link to="/">Explorar NFTs</Link>
          </Button>
        </div>
      ) : (
        <div className="checkout-grid">
          <div>
            <div className="cart-list">
              {cart.data.lines.map((l) => (
                <article className="cart-row" key={l.nftId + l.edition}>
                  <img src={l.image} alt={l.name} width="96" height="96" />
                  <div>
                    <Link to="/nft/$id" params={{ id: l.nftId }}>
                      <h3>{l.name}</h3>
                    </Link>
                    <p>{l.edition === 'rare' ? 'Edição rara' : 'Original'}</p>
                    <strong>{l.price} ETH</strong>
                    {l.quantity > l.stock && (
                      <p role="alert">Quantidade indisponível. Ajuste ou remova este item.</p>
                    )}
                  </div>
                  <div className="cart-controls">
                    <Field
                      label={`Quantidade de ${l.name}`}
                      type="number"
                      min="1"
                      max={l.stock}
                      value={l.quantity}
                      disabled={update.isPending}
                      onChange={(e) =>
                        update.mutate({
                          nftId: l.nftId,
                          edition: l.edition,
                          quantity: Number(e.target.value),
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        update.mutate({
                          nftId: l.nftId,
                          edition: l.edition,
                          quantity: 0,
                        })
                      }
                    >
                      Remover
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <form
              className="coupon"
              onSubmit={(e) => {
                e.preventDefault();
                apply.mutate(coupon);
              }}
            >
              <Field
                label="Cupom de desconto"
                placeholder="Experimente JUNGLE10"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <Button type="submit" variant="outline" disabled={apply.isPending}>
                Aplicar cupom
              </Button>
              {cart.data.coupon && (
                <Button variant="ghost" type="button" onClick={() => apply.mutate('')}>
                  Remover cupom
                </Button>
              )}
            </form>
            {apply.error && <ErrorBox error={apply.error} />}
            <p role="status">{cart.data.coupon && 'Cupom aplicado com sucesso.'}</p>
            {update.error && <ErrorBox error={update.error} />}
            <Link to="/" className="text-link">
              ← Continuar explorando
            </Link>
          </div>
          <Summary quote={cart.data}>
            <Button asChild disabled={!cart.data.valid}>
              <Link to="/checkout">
                Ir para pagamento <ArrowRight size={18} />
              </Link>
            </Button>
          </Summary>
        </div>
      )}
    </>
  );
}
type Attempt = {
  key: string;
  payload: {
    fingerprint: string;
    wallet: string;
    network: string;
    name: string;
    email: string;
  };
  orderId?: string;
};
export function Checkout() {
  const { data: user } = useSession();
  const cart = useCart();
  const wallets = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: ({ signal }) => get<Wallet[]>('/wallets', signal),
    enabled: !!user,
  });
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(''),
    [network, setNetwork] = useState('Ethereum'),
    [connected, setConnected] = useState(false),
    [refuse, setRefuse] = useState(false),
    [review, setReview] = useState<Quote | null>(null),
    [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [feedback, setFeedback] = useState('');
  const lock = useRef(false);
  const storageKey = 'greenmint.attempt.' + user?.id;
  const [attempt, setAttempt] = useState<Attempt | null>(() =>
    JSON.parse(localStorage.getItem(storageKey) || 'null'),
  );
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);
  useEffect(() => {
    if (wallets.data?.length && !wallet) {
      const w = wallets.data.find((w) => w.primary) || wallets.data[0];
      setWallet(w.id);
      setNetwork(w.network);
    }
  }, [wallets.data, wallet]);
  const purchase = useMutation({
    mutationFn: async () => {
      if (lock.current) throw new Error('Pedido já em envio.');
      lock.current = true;
      try {
        let currentAttempt = attempt;
        if (!currentAttempt) {
          const current = await post<Quote>('/quote', {});
          if (current.fingerprint !== review?.fingerprint || !current.valid) {
            setReview(current);
            void queryClient.invalidateQueries({ queryKey: ['cart'] });
            throw new Error(
              'Preço ou disponibilidade mudou. Revise os valores e confirme novamente.',
            );
          }
          currentAttempt = {
            key: crypto.randomUUID(),
            payload: {
              fingerprint: current.fingerprint,
              wallet,
              network,
              name,
              email,
            },
          };
          setAttempt(currentAttempt);
          localStorage.setItem(storageKey, JSON.stringify(currentAttempt));
        }
        const order = (
          await api.post<Order>('/orders', currentAttempt.payload, {
            headers: { 'Idempotency-Key': currentAttempt.key },
          })
        ).data;
        localStorage.setItem(storageKey, JSON.stringify({ ...currentAttempt, orderId: order.id }));
        return order;
      } finally {
        lock.current = false;
      }
    },
    onSuccess: (order) => void navigate({ to: '/order/$id', params: { id: order.id } }),
    onError: (e) => {
      if ((e as { response?: { status: number } }).response?.status === 409) {
        localStorage.removeItem(storageKey);
        setAttempt(null);
        setReview(null);
      }
    },
  });
  const beginReview = useMutation({
    mutationFn: () => post<Quote>('/quote', {}),
    onSuccess: (q) => {
      setReview(q);
      setFeedback('Confira os dados e o total antes de confirmar.');
    },
  });
  if (cart.isPending || wallets.isPending) return <Skeleton />;
  if (cart.error || wallets.error)
    return (
      <ErrorBox
        error={cart.error || wallets.error}
        retry={() => {
          void cart.refetch();
          void wallets.refetch();
        }}
      />
    );
  if (attempt?.orderId)
    return (
      <>
        <Head title="Você tem um pedido em andamento" />
        <Button asChild>
          <Link to="/order/$id" params={{ id: attempt.orderId }}>
            Acompanhar pedido
          </Link>
        </Button>
      </>
    );
  if (!cart.data?.lines.length && !attempt)
    return (
      <>
        <Head title="Seu carrinho está vazio" />
        <Link to="/">Explorar marketplace</Link>
      </>
    );
  return (
    <>
      <Head title="Pagamento" subtitle="Só mais um passo para sua nova coleção." />
      <div className="steps">
        <span>01 Carrinho</span>
        <strong>02 Pagamento</strong>
        <span>03 Confirmação</span>
      </div>
      <div className="checkout-grid">
        <div>
          <form
            className="panel stack"
            onSubmit={(e) => {
              e.preventDefault();
              beginReview.mutate();
            }}
          >
            <h2>Dados do colecionador</h2>
            <Field
              label="Nome completo"
              value={name}
              required
              minLength={2}
              onChange={(e) => {
                setName(e.target.value);
                setReview(null);
              }}
            />
            <Field
              label="E-mail"
              type="email"
              value={email}
              required
              onChange={(e) => {
                setEmail(e.target.value);
                setReview(null);
              }}
            />
            <h2>Carteira e rede</h2>
            {!wallets.data?.length ? (
              <p>
                Cadastre uma carteira para continuar. <Link to="/wallets">Gerenciar carteiras</Link>
              </p>
            ) : (
              <>
                <Select
                  label="Carteira"
                  value={wallet}
                  onChange={(e) => {
                    setWallet(e.target.value);
                    setConnected(false);
                    setReview(null);
                  }}
                >
                  {wallets.data.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label} — {w.address.slice(0, 6)}…{w.address.slice(-4)}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Rede de pagamento"
                  value={network}
                  onChange={(e) => {
                    setNetwork(e.target.value);
                    setConnected(false);
                    setReview(null);
                  }}
                >
                  <option>Ethereum</option>
                  <option>Polygon</option>
                </Select>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={refuse}
                    onChange={(e) => setRefuse(e.target.checked)}
                  />
                  Simular recusa de conexão
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReview(null);
                    if (connected) {
                      setConnected(false);
                      setFeedback('Carteira desconectada.');
                    } else if (refuse)
                      setFeedback('Conexão recusada pela carteira. Tente novamente.');
                    else if (wallets.data.find((w) => w.id === wallet)?.network !== network)
                      setFeedback('Selecione a mesma rede cadastrada na carteira.');
                    else {
                      setConnected(true);
                      setFeedback('Carteira conectada na simulação.');
                    }
                  }}
                >
                  {connected ? 'Desconectar carteira' : 'Conectar carteira'}
                </Button>
                <Button type="submit" disabled={!connected || beginReview.isPending || !!attempt}>
                  Revisar pedido
                </Button>
              </>
            )}
            <p role="status">{feedback}</p>
            {beginReview.error && <ErrorBox error={beginReview.error} />}
          </form>
          {review && (
            <section className="panel review">
              <h2>Revise seu pedido</h2>
              <p>
                {name} · {email}
              </p>
              <p>
                {network} · {review.lines.length} item(ns)
              </p>
              <p>
                Total: <strong>{review.total} ETH</strong>
              </p>
              {!review.valid && (
                <p role="alert">Itens indisponíveis. Volte ao carrinho para ajustar.</p>
              )}
            </section>
          )}
          {purchase.error && <ErrorBox error={purchase.error} />}
        </div>
        <Summary
          quote={
            review || (attempt ? (JSON.parse(attempt.payload.fingerprint) as Quote) : cart.data!)
          }
        >
          {(review || attempt) && (
            <Button
              disabled={purchase.isPending || (!attempt && (!connected || !review?.valid))}
              onClick={() => purchase.mutate()}
            >
              {purchase.isPending
                ? 'Enviando…'
                : attempt
                  ? 'Recuperar mesma tentativa'
                  : 'Confirmar compra simulada'}
            </Button>
          )}
          <Link to="/cart">Voltar ao carrinho</Link>
        </Summary>
      </div>
    </>
  );
}
export function Receipt() {
  const { id } = useParams({ from: '/order/$id' });
  const { data: user } = useSession();
  const order = useQuery({
    queryKey: ['order', user?.id, id],
    queryFn: ({ signal }) => get<Order>('/orders/' + id, signal),
    refetchInterval: (q) => (q.state.data?.status === 'pending' ? 1500 : false),
  });
  useEffect(() => {
    if (order.data && order.data.status !== 'pending') {
      localStorage.removeItem('greenmint.attempt.' + user?.id);
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  }, [order.data?.status, user?.id]);
  if (order.isPending) return <Skeleton />;
  if (order.error) return <ErrorBox error={order.error} retry={() => void order.refetch()} />;
  const o = order.data;
  return (
    <>
      <div className="receipt-heading" role="status">
        {o.status === 'confirmed' && <CheckCircle2 size={56} />}
        <Head
          title={
            o.status === 'confirmed'
              ? 'Pedido confirmado!'
              : o.status === 'declined'
                ? 'Pagamento recusado'
                : 'Pedido pendente'
          }
          subtitle={
            o.status === 'confirmed'
              ? 'Sua nova coleção está esperando por você.'
              : o.status === 'declined'
                ? 'Seus itens foram preservados. Você pode tentar novamente.'
                : 'Estamos aguardando a confirmação da simulação. Você pode atualizar esta página.'
          }
        />
        <p>
          Pedido <strong>{o.id}</strong>
        </p>
      </div>
      <div className="checkout-grid">
        <section className="panel">
          <h2>{o.status === 'confirmed' ? 'Seus NFTs' : 'Itens do pedido'}</h2>
          {o.quote.lines.map((l) => (
            <div className="receipt-item" key={l.nftId + l.edition}>
              <img src={l.image} width="72" height="72" alt={l.name} />
              <div>
                <h3>{l.name}</h3>
                <p>
                  {l.quantity} × {l.price} ETH
                </p>
              </div>
            </div>
          ))}
          {o.status === 'confirmed' && (
            <>
              <h3>Transação simulada</h3>
              <p className="break">{o.transaction}</p>
              <details>
                <summary>Ver referência da simulação</summary>
                <p>
                  Esta referência não existe em exploradores de blockchain. O recibo mantém os
                  valores originais do pedido.
                </p>
              </details>
            </>
          )}
          <Button asChild>
            <Link to={o.status === 'declined' ? '/checkout' : '/'}>
              {o.status === 'declined' ? 'Tentar novo pagamento' : 'Continuar explorando'}
            </Link>
          </Button>
        </section>
        <Summary quote={o.quote} />
      </div>
    </>
  );
}
export function Auth({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      await beginSessionTransition();
      return post<User>(register ? '/register' : '/login', data);
    },
    onSuccess: async (user) => {
      await queryClient.cancelQueries();
      queryClient.clear();
      queryClient.setQueryData(['session'], user);
      await navigate({ to: (search.returnTo || '/') as '/' });
    },
  });
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (register && data.password !== data.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    mutation.mutate(data);
  }
  return (
    <div className="auth-grid">
      <section className="auth-story">
        <p className="eyebrow">BEM-VINDO AO KURIO</p>
        <h1>
          Sua coleção.
          <br />
          Sua identidade.
          <br />
          <em>Seu universo.</em>
        </h1>
        <p>Conecte-se à próxima geração de colecionadores.</p>
        <div className="auth-art">
          {[1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src={`/art/${['emerald', 'sage', 'ivory', 'golden'][i - 1]}.webp`}
              alt="Arte da coleção Kurio"
              width="200"
              height="200"
            />
          ))}
        </div>
      </section>
      <form className="auth-form panel stack" onSubmit={submit}>
        <h2>{register ? 'Crie sua conta' : 'Bom ter você de volta'}</h2>
        <p>
          {register
            ? 'Comece a explorar novas possibilidades.'
            : 'Entre para continuar sua jornada.'}
        </p>
        {register && (
          <Field label="Nome completo" name="name" autoComplete="name" required minLength={2} />
        )}
        <Field label="E-mail" name="email" type="email" autoComplete="email" required />
        <Field
          label="Senha"
          name="password"
          type="password"
          autoComplete={register ? 'new-password' : 'current-password'}
          required
          minLength={8}
          aria-describedby="auth-hint"
        />
        {register && (
          <Field
            label="Confirmar senha"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        )}
        <p id="auth-hint">Use pelo menos 8 caracteres. Demo: ana@demo.com / Demo123!</p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {mutation.error && <ErrorBox error={mutation.error} />}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar na conta'}
        </Button>
        <p>
          {register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
          <Link to={register ? '/login' : '/register'}>{register ? 'Entrar' : 'Cadastre-se'}</Link>
        </p>
      </form>
    </div>
  );
}
function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head title="Minha conta" subtitle="Seu espaço no universo Kurio." />
      <div className="account-grid">
        <nav aria-label="Conta" className="account-nav">
          <Link to="/profile">Perfil do colecionador</Link>
          <Link to="/wallets">Minhas carteiras</Link>
          <Link to="/favorites">Favoritos</Link>
        </nav>
        <div>{children}</div>
      </div>
    </>
  );
}
export function Profile() {
  const { data: user } = useSession();
  const profile = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: ({ signal }) => get<User>('/profile', signal),
  });
  const [avatar, setAvatar] = useState(''),
    [feedback, setFeedback] = useState('');
  const update = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.patch('/profile', data),
    onSuccess: () => {
      setFeedback('Perfil atualizado.');
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
  const password = useMutation({
    mutationFn: (data: Record<string, string>) => post('/password', data),
    onSuccess: () => setFeedback('Senha alterada com sucesso.'),
  });
  return (
    <AccountLayout>
      {profile.isPending ? (
        <Skeleton />
      ) : profile.error ? (
        <ErrorBox error={profile.error} />
      ) : (
        <>
          <form
            key={profile.data.email}
            className="panel stack"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({
                ...Object.fromEntries(new FormData(e.currentTarget)),
                avatar: avatar || profile.data.avatar,
              });
            }}
          >
            <h2>Perfil do colecionador</h2>
            <img
              className="avatar"
              src={avatar || profile.data.avatar}
              width="80"
              height="80"
              alt="Seu avatar"
            />
            <Field
              label="Alterar avatar (PNG, JPEG ou WebP, até 200 KB)"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (
                  f.size > 200000 ||
                  !['image/png', 'image/jpeg', 'image/webp'].includes(f.type)
                ) {
                  setFeedback('Escolha uma imagem PNG, JPEG ou WebP de até 200 KB.');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setAvatar(String(reader.result));
                reader.readAsDataURL(f);
              }}
            />
            <Field
              label="Nome completo"
              name="name"
              defaultValue={profile.data.name}
              required
              minLength={2}
            />
            <Field
              label="E-mail"
              name="email"
              type="email"
              defaultValue={profile.data.email}
              required
            />
            <Button type="submit" disabled={update.isPending}>
              Salvar perfil
            </Button>
            {update.error && <ErrorBox error={update.error} />}
          </form>
          <form
            className="panel stack"
            onSubmit={(e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<
                string,
                string
              >;
              if (data.password !== data.confirm) {
                setFeedback('As senhas não coincidem.');
                return;
              }
              password.mutate(data);
            }}
          >
            <h2>Alterar senha</h2>
            <Field
              label="Senha atual"
              name="current"
              type="password"
              autoComplete="current-password"
              required
            />
            <Field
              label="Nova senha"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Field
              label="Confirmar nova senha"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Button type="submit" disabled={password.isPending}>
              Alterar senha
            </Button>
            {password.error && <ErrorBox error={password.error} />}
          </form>
          <p role="status">{feedback}</p>
        </>
      )}
    </AccountLayout>
  );
}
export function Wallets() {
  const opener = useRef<HTMLButtonElement | null>(null);
  const { data: user } = useSession();
  const wallets = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: ({ signal }) => get<Wallet[]>('/wallets', signal),
  });
  const [editing, setEditing] = useState<Wallet | null>(null),
    [open, setOpen] = useState(false),
    [feedback, setFeedback] = useState('');
  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => post('/wallets', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setOpen(false);
      setFeedback('Carteira salva.');
    },
  });
  return (
    <AccountLayout>
      <div className="section-title">
        <h2>Minhas carteiras</h2>
        <Button
          onClick={(event) => {
            opener.current = event.currentTarget;
            setEditing(null);
            mutation.reset();
            setOpen(true);
          }}
          disabled={(wallets.data?.length || 0) >= 2}
        >
          Adicionar carteira
        </Button>
      </div>
      {wallets.isPending ? (
        <Skeleton />
      ) : wallets.error ? (
        <ErrorBox error={wallets.error} />
      ) : (
        wallets.data.map((w) => (
          <article className="panel wallet-card" key={w.id}>
            <WalletIcon />
            <div>
              <h3>
                {w.label} {w.primary && <span className="badge">Principal</span>}
              </h3>
              <p>{w.network}</p>
              <p className="break">{w.address}</p>
            </div>
            <Button
              variant="outline"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setEditing(w);
                mutation.reset();
                setOpen(true);
              }}
            >
              Editar
            </Button>
          </article>
        ))
      )}
      {!wallets.isPending && !wallets.data?.length && <p>Nenhuma carteira cadastrada.</p>}
      <p role="status">{feedback}</p>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay" />
          <Dialog.Content
            className="dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              opener.current?.focus();
            }}
          >
            <Dialog.Title>{editing ? 'Editar carteira' : 'Adicionar carteira'}</Dialog.Title>
            <Dialog.Description>
              Cadastre uma carteira fictícia para suas compras simuladas.
            </Dialog.Description>
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                mutation.mutate({
                  ...data,
                  id: editing?.id || '',
                  primary: data.primary === 'on',
                });
              }}
            >
              <Field label="Nome da carteira" name="label" defaultValue={editing?.label} required />
              <Field
                label="Endereço da carteira"
                name="address"
                defaultValue={editing?.address}
                placeholder={'0x' + 'a'.repeat(40)}
                pattern="0x[0-9a-fA-F]{40}"
                required
              />
              <Select
                label="Rede da carteira"
                name="network"
                defaultValue={editing?.network || 'Ethereum'}
              >
                <option>Ethereum</option>
                <option>Polygon</option>
              </Select>
              <label className="check">
                <input type="checkbox" name="primary" defaultChecked={editing?.primary} />
                Definir como principal
              </label>
              {mutation.error && <ErrorBox error={mutation.error} />}
              <Button type="submit" disabled={mutation.isPending}>
                Salvar carteira
              </Button>
              <Dialog.Close asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Dialog.Close>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AccountLayout>
  );
}
export function Favorites() {
  const { data: user } = useSession();
  const favorites = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: ({ signal }) => get<string[]>('/favorites', signal),
  });
  const catalog = useQuery({
    queryKey: ['favorite-nfts', favorites.data],
    queryFn: () => Promise.all(favorites.data!.map((id) => get<NFT>('/nfts/' + id))),
    enabled: !!favorites.data,
  });
  return (
    <AccountLayout>
      <h2>Seus favoritos</h2>
      {favorites.error || catalog.error ? (
        <ErrorBox error={favorites.error || catalog.error} />
      ) : favorites.isPending || catalog.isPending ? (
        <Skeleton cards />
      ) : catalog.data.length ? (
        <div className="cards">
          {catalog.data.map((n) => (
            <Card key={n.id} nft={n} />
          ))}
        </div>
      ) : (
        <p>Você ainda não tem favoritos. Explore o marketplace e salve suas obras preferidas.</p>
      )}
    </AccountLayout>
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
