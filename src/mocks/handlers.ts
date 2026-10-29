import { http, HttpResponse, delay, ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { db, save, reset, user, owner, publicUser, quote, hash, settle } from './db';
import type { CartItem, Order, Wallet } from '../contracts';
import { wei } from '../contracts';
// MSW normalizes the Socket.IO transport prefix to '/' when matching.
const channel = ws.link('wss://realtime.greenmint.test/');
type Peer = {
  send: (event: string, data: unknown) => void;
  close: () => void;
  userId?: string;
};
const peers = new Set<Peer>();
const emit = (event: string, data: { userId?: string; [key: string]: unknown }) =>
  peers.forEach((p) => {
    if (!data.userId || p.userId === data.userId) p.send(event, data);
  });
const error = (message: string, status = 400) => HttpResponse.json({ message }, { status });
function settleAndEmit(order: Order) {
  if (!settle(order)) return;
  emit('order.updated', {
    id: `order-${order.id}-${order.version}`,
    resourceId: order.id,
    version: order.version,
    userId: order.userId,
  });
  if (order.status === 'confirmed')
    for (const line of order.quote.lines) {
      const nft = db.nfts.find((n) => n.id === line.nftId)!;
      emit('nft.updated', {
        id: `nft-${nft.id}-${nft.version}`,
        resourceId: nft.id,
        version: nft.version,
      });
    }
}
export const handlers = [
  channel.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection);
    const peer: Peer = {
      send: (e, d) => io.client.emit(e, d),
      close: () => connection.client.close(),
      userId: user()?.id,
    };
    peers.add(peer);
    const heartbeat = setInterval(() => connection.client.send('2'), 20000);
    connection.client.addEventListener('close', () => {
      clearInterval(heartbeat);
      peers.delete(peer);
    });
  }),
  http.all('/api/*', async ({ request }) => {
    const url = new URL(request.url),
      path = url.pathname.slice(4),
      method = request.method;
    const body = method === 'GET' ? {} : ((await request.json()) as Record<string, unknown>);
    if (path === '/demo/reset') {
      await reset();
      return HttpResponse.json({ ok: true });
    }
    if (path === '/demo') {
      db.scenario = String(body.scenario || 'normal');
      if (db.scenario === 'expired' && db.session) db.session.expires = 0;
      save();
      return HttpResponse.json({ ok: true });
    }
    if (path === '/demo/event') {
      const nft = db.nfts.find((n) => n.id === String(body.id || '1'))!;
      if (body.action === 'disconnect') {
        peers.forEach((p) => p.close());
        return HttpResponse.json({ ok: true });
      }
      nft.version++;
      if (body.action === 'stock') nft.editions[0].stock = 0;
      else nft.price = '0.75';
      save();
      const payload = {
        id: `nft-${nft.id}-${nft.version}`,
        resourceId: nft.id,
        version: nft.version,
      };
      emit('nft.updated', payload);
      if (body.action === 'duplicate') {
        emit('nft.updated', payload);
        emit('nft.updated', { ...payload, id: 'old', version: 1 });
      }
      return HttpResponse.json({ ok: true });
    }
    await delay(
      db.scenario === 'slow'
        ? 2200
        : db.scenario === 'race'
          ? url.searchParams.get('q')?.length === 1
            ? 900
            : 80
          : 100,
    );
    if (db.scenario === 'offline') return HttpResponse.error();
    if (db.scenario === 'server-error')
      return error('Serviço temporariamente indisponível. Tente novamente.', 503);
    if (path === '/session' && method === 'GET')
      return HttpResponse.json(user() ? publicUser(user()!) : null);
    if (path === '/logout') {
      db.session = null;
      save();
      return HttpResponse.json({ ok: true });
    }
    if (path === '/login' || path === '/register') {
      const email = String(body.email || '')
          .trim()
          .toLowerCase(),
        password = String(body.password || '');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8)
        return error('E-mail válido e senha de pelo menos 8 caracteres são obrigatórios.', 422);
      let account = db.users.find((u) => u.email === email);
      if (path === '/register') {
        if (account) return error('Este e-mail já está cadastrado.', 409);
        if (String(body.name || '').trim().length < 2)
          return error('Informe seu nome completo.', 422);
        const salt = crypto.randomUUID();
        account = {
          id: crypto.randomUUID(),
          name: String(body.name),
          email,
          avatar: '/art/emerald.webp',
          salt,
          hash: await hash(password, salt),
          wallets: [],
          favorites: [],
        };
        db.users.push(account);
      } else if (!account || account.hash !== (await hash(password, account.salt)))
        return error('E-mail ou senha incorretos.', 401);
      db.session = { userId: account!.id, expires: Date.now() + 3600000 };
      const target = db.carts[account!.id] || [];
      for (const item of db.carts.guest || []) {
        const existing = target.find((x) => x.nftId === item.nftId && x.edition === item.edition);
        const stock = db.nfts
          .find((n) => n.id === item.nftId)!
          .editions.find((e) => e.id === item.edition)!.stock;
        if (existing) existing.quantity = Math.min(stock, existing.quantity + item.quantity);
        else target.push({ ...item, quantity: Math.min(stock, item.quantity) });
      }
      db.carts[account!.id] = target.filter((i) => i.quantity > 0);
      db.carts.guest = [];
      save();
      return HttpResponse.json(publicUser(account!));
    }
    if (path === '/nfts') {
      const min = url.searchParams.get('min') || '',
        max = url.searchParams.get('max') || '';
      if ([min, max].some((v) => v && !/^\d+(\.\d{1,18})?$/.test(v)))
        return error('Faixa de preço inválida.', 422);
      let items = db.nfts.filter(
        (n) =>
          (n.name + ' ' + n.artist)
            .toLowerCase()
            .includes((url.searchParams.get('q') || '').toLowerCase()) &&
          (!url.searchParams.get('category') || n.category === url.searchParams.get('category')) &&
          (!url.searchParams.get('network') || n.network === url.searchParams.get('network')) &&
          (!min || wei(n.price) >= wei(min)) &&
          (!max || wei(n.price) <= wei(max)),
      );
      const sort = url.searchParams.get('sort');
      items = items.sort((a, b) =>
        sort === 'low'
          ? wei(a.price) < wei(b.price)
            ? -1
            : wei(a.price) > wei(b.price)
              ? 1
              : 0
          : sort === 'high'
            ? wei(b.price) < wei(a.price)
              ? -1
              : wei(b.price) > wei(a.price)
                ? 1
                : 0
            : Number(a.id) - Number(b.id),
      );
      const page = Math.max(1, Number(url.searchParams.get('page') || 1));
      return HttpResponse.json({
        items: items.slice((page - 1) * 8, page * 8),
        total: items.length,
      });
    }
    if (path.startsWith('/nfts/')) {
      const nft = db.nfts.find((n) => n.id === path.split('/')[2]);
      return nft ? HttpResponse.json(nft) : error('NFT não encontrado.', 404);
    }
    if (db.session && !user() && path === '/quote')
      return error('Sua sessão expirou. Entre novamente para continuar.', 401);
    if (path === '/cart') {
      const id = owner();
      db.carts[id] ??= [];
      if (method !== 'GET') {
        const item = body as unknown as CartItem;
        const nft = db.nfts.find((n) => n.id === item.nftId);
        const edition = nft?.editions.find((e) => e.id === item.edition);
        if (!edition) return error('Edição não encontrada.', 404);
        if (!Number.isInteger(item.quantity) || item.quantity < 0 || item.quantity > edition.stock)
          return error('Quantidade indisponível.', 409);
        db.carts[id] = db.carts[id].filter(
          (i) => i.nftId !== item.nftId || i.edition !== item.edition,
        );
        if (item.quantity) db.carts[id].push(item);
        save();
      }
      return HttpResponse.json(quote());
    }
    if (path === '/quote') {
      if (method === 'POST' && 'coupon' in body) {
        const coupon = String(body.coupon).toUpperCase();
        if (coupon && coupon !== 'JUNGLE10')
          return error(coupon === 'EXPIRED' ? 'Cupom expirado.' : 'Cupom inválido.', 422);
        db.coupons[owner()] = coupon;
        save();
      }
      return HttpResponse.json(quote());
    }
    const account = user();
    if (!account) return error('Sua sessão expirou. Entre novamente para continuar.', 401);
    if (path === '/favorites') {
      if (method !== 'GET') {
        if (db.scenario === 'favorite-error')
          return error('Não foi possível salvar o favorito.', 503);
        const id = String(body.id);
        account.favorites = body.active
          ? [...new Set([...account.favorites, id])]
          : account.favorites.filter((x) => x !== id);
        save();
      }
      return HttpResponse.json(account.favorites);
    }
    if (path === '/profile') {
      if (method === 'PATCH') {
        const name = String(body.name || '').trim(),
          email = String(body.email || '')
            .trim()
            .toLowerCase();
        if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email))
          return error('Nome e e-mail válidos são obrigatórios.', 422);
        if (db.users.some((u) => u.id !== account.id && u.email === email))
          return error('E-mail já utilizado.', 409);
        if (String(body.avatar || '').length > 300000)
          return error('Avatar deve ter até 200 KB.', 422);
        Object.assign(account, {
          name,
          email,
          avatar: String(body.avatar || account.avatar),
        });
        save();
      }
      return HttpResponse.json(publicUser(account));
    }
    if (path === '/password') {
      if ((await hash(String(body.current), account.salt)) !== account.hash)
        return error('Senha atual incorreta.', 422);
      if (String(body.password).length < 8)
        return error('Nova senha deve ter pelo menos 8 caracteres.', 422);
      account.hash = await hash(String(body.password), account.salt);
      save();
      return HttpResponse.json({ ok: true });
    }
    if (path === '/wallets') {
      if (method !== 'GET') {
        const wallet = body as unknown as Wallet;
        if (
          !wallet.label?.trim() ||
          !/^0x[0-9a-fA-F]{40}$/.test(wallet.address) ||
          !['Ethereum', 'Polygon'].includes(wallet.network)
        )
          return error('Informe nome, rede e endereço hexadecimal de 42 caracteres.', 422);
        if (!wallet.id && account.wallets.length >= 2)
          return error('Cadastre no máximo duas carteiras.', 422);
        if (
          account.wallets.some(
            (w) =>
              w.id !== wallet.id &&
              w.address.toLowerCase() === wallet.address.toLowerCase() &&
              w.network === wallet.network,
          )
        )
          return error('Carteira já cadastrada nesta rede.', 409);
        if (wallet.primary) account.wallets.forEach((w) => (w.primary = false));
        const existing = account.wallets.find((w) => w.id === wallet.id);
        if (existing) Object.assign(existing, wallet);
        else
          account.wallets.push({
            ...wallet,
            id: crypto.randomUUID(),
            primary: account.wallets.length === 0 || wallet.primary,
          });
        if (!account.wallets.some((w) => w.primary)) account.wallets[0].primary = true;
        save();
      }
      return HttpResponse.json(account.wallets);
    }
    if (path === '/orders' && method === 'POST') {
      const key = request.headers.get('Idempotency-Key');
      if (!key) return error('Chave de idempotência obrigatória.', 422);
      const payload = JSON.stringify(body);
      const previous = db.orders.find((o) => o.key === key && o.userId === account.id);
      if (previous)
        return previous.payload === payload
          ? HttpResponse.json(previous)
          : error('Chave já utilizada com outro conteúdo.', 409);
      if (
        String(body.name || '').trim().length < 2 ||
        !/^\S+@\S+\.\S+$/.test(String(body.email || ''))
      )
        return error('Dados do colecionador inválidos.', 422);
      const current = quote();
      if (!current.valid || body.fingerprint !== current.fingerprint)
        return error('Preço ou disponibilidade mudou. Revise a nova cotação.', 409);
      if (!account.wallets.some((w) => w.id === body.wallet && w.network === body.network))
        return error('Carteira incompatível com a rede.', 422);
      const order: Order = {
        id: `GM-${++db.counter}`,
        userId: account.id,
        status: 'pending',
        version: 1,
        quote: structuredClone(current),
        transaction: `SIM-${crypto.randomUUID()}`,
        createdAt: Date.now(),
        settleAt: Date.now() + (db.scenario === 'pending' ? 20000 : 2500),
        outcome: db.scenario === 'declined' ? 'declined' : 'confirmed',
        key,
        payload,
      };
      db.orders.push(order);
      save();
      if (db.scenario === 'timeout') {
        await delay(12000);
      }
      return HttpResponse.json(order, { status: 201 });
    }
    if (path.startsWith('/orders/')) {
      const order = db.orders.find((o) => o.id === path.split('/')[2]);
      if (!order) return error('Pedido não encontrado.', 404);
      if (order.userId !== account.id) return error('Acesso não permitido.', 403);
      settleAndEmit(order);
      return HttpResponse.json(order);
    }
    return error('Recurso não encontrado.', 404);
  }),
];
export function startSettlement() {
  return setInterval(() => db.orders.forEach(settleAndEmit), 500);
}
