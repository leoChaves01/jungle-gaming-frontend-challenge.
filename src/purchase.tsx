import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api, get, post, queryClient } from './api';
import { Button } from './components/ui/button';
import type { NFT, Order, Quote, Wallet } from './contracts';
import {
  Card,
  ErrorBox,
  Field,
  Head,
  Select,
  Skeleton,
  Summary,
  useCart,
  useSession,
} from './screens';
export function Cart() {
  const cart = useCart();
  const related = useQuery({
    queryKey: ['nfts', 'cart-related'],
    queryFn: ({ signal }) => get<{ items: NFT[] }>('/nfts?page=1', signal),
  });
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
    <div className="purchase-page cart-page">
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
        <>
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
          <section className="related-collection cart-related" aria-labelledby="cart-related-title">
            <h2 id="cart-related-title">Colecionadores também viram</h2>
            {related.isPending ? (
              <Skeleton cards />
            ) : related.error ? (
              <ErrorBox error={related.error} retry={() => void related.refetch()} />
            ) : (
              <div className="cards">
                {related.data.items
                  .filter((item) => !cart.data.lines.some((line) => line.nftId === item.id))
                  .slice(0, 5)
                  .map((item) => (
                    <Card key={item.id} nft={item} />
                  ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
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
    <div className="purchase-page checkout-page">
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
    </div>
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
