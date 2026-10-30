import {
  eth,
  wei,
  type NFT,
  type User,
  type Wallet,
  type CartItem,
  type Order,
  type Quote,
} from '../contracts';
type Account = User & {
  hash: string;
  salt: string;
  wallets: Wallet[];
  favorites: string[];
};
type DB = {
  users: Account[];
  nfts: NFT[];
  carts: Record<string, CartItem[]>;
  coupons: Record<string, string>;
  orders: Order[];
  session: { userId: string; expires: number } | null;
  scenario: string;
  counter: number;
};
const key = 'greenmint.mock.v3';
export async function hash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return Array.from(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: new TextEncoder().encode(salt),
          iterations: 100000,
          hash: 'SHA-256',
        },
        key,
        256,
      ),
    ),
  )
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}
export const db: DB = JSON.parse(localStorage.getItem(key) || 'null') || {
  users: [],
  nfts: [],
  carts: { guest: [] },
  coupons: {},
  orders: [],
  session: null,
  scenario: 'normal',
  counter: 0,
};
export const save = () => localStorage.setItem(key, JSON.stringify(db));
export async function reset() {
  db.users = await Promise.all(
    ['ana', 'bruno'].map(async (name, i) => ({
      id: `u${i + 1}`,
      name: name === 'ana' ? 'Ana Silva' : 'Bruno Costa',
      email: `${name}@demo.com`,
      avatar: '/art/emerald.webp',
      salt: name,
      hash: await hash('Demo123!', name),
      wallets: [
        {
          id: 'w1',
          label: 'Principal',
          address: `0x${String(i + 1).repeat(40)}`,
          network: 'Ethereum',
          primary: true,
        },
      ],
      favorites: [],
    })),
  );
  db.nfts = Array.from({ length: 36 }, (_, i) => ({
    id: String(i + 1),
    name:
      [
        'Emerald Ape #042',
        'Sage Nomad #009',
        'Neon Vessel #552',
        'Cosmic Bloom #118',
        'Violet Nomad #314',
        'Ivory Baron #088',
        'Golden Beat #207',
        'Golden Frequency #071',
        'Golden Signal #160',
      ][i % 9] + (i < 9 ? '' : ` · Série ${Math.floor(i / 9) + 1}`),
    artist: ['Satoshi Studio', 'Yuki', 'Jungle Collective', 'Pixel Lab'][i % 4],
    category: ['Arte', 'Colecionáveis', 'Fotografia', 'Gaming'][i % 4],
    network: i % 3 ? 'Ethereum' : 'Polygon',
    image:
      '/art/' +
      ['emerald', 'sage', 'ivory', 'sage', 'sage', 'ivory', 'golden', 'golden', 'golden'][i % 9] +
      '.webp',
    price: eth(
      wei(['1.19', '1.69', '1.99', '1.29', '1.39', '1.79', '0.99', '0.59', '0.39'][i % 9]) +
        BigInt(Math.floor(i / 9)) * 100000000000000000n,
    ),
    version: 1,
    editions: [
      { id: 'standard', name: 'Original', stock: 8 },
      { id: 'rare', name: 'Edição rara', stock: i % 5 === 0 ? 0 : 3 },
    ],
  }));
  db.carts = { guest: [] };
  db.coupons = {};
  db.orders = [];
  db.session = null;
  db.scenario = 'normal';
  db.counter = 0;
  save();
}
export const user = () =>
  db.session && db.session.expires > Date.now()
    ? db.users.find((u) => u.id === db.session!.userId)
    : undefined;
export const owner = () => user()?.id || 'guest';
export const publicUser = (u: Account): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
});
export function quote(): Quote {
  const id = owner();
  const lines = (db.carts[id] || []).map((item) => {
    const nft = db.nfts.find((n) => n.id === item.nftId)!;
    return {
      ...item,
      name: nft.name,
      image: nft.image,
      price: nft.price,
      stock: Math.max(
        0,
        (nft.editions.find((e) => e.id === item.edition)?.stock || 0) -
          db.orders
            .filter((o) => o.status === 'pending')
            .flatMap((o) => o.quote.lines)
            .filter((l) => l.nftId === item.nftId && l.edition === item.edition)
            .reduce((sum, l) => sum + l.quantity, 0),
      ),
    };
  });
  const subtotal = lines.reduce((v, l) => v + wei(l.price) * BigInt(l.quantity), 0n);
  const coupon = db.coupons[id] || '';
  const discount = coupon === 'JUNGLE10' ? subtotal / 10n : 0n;
  const fee = lines.length ? 1000000000000000n : 0n;
  const result = {
    lines,
    subtotal: eth(subtotal),
    discount: eth(discount),
    fee: eth(fee),
    total: eth(subtotal - discount + fee),
    coupon,
    valid: lines.length > 0 && lines.every((l) => l.quantity <= l.stock),
  };
  return { ...result, fingerprint: JSON.stringify(result) };
}
export function settle(order: Order) {
  if (order.status !== 'pending' || Date.now() < order.settleAt) return false;
  const available = order.quote.lines.every(
    (line) =>
      (db.nfts.find((n) => n.id === line.nftId)?.editions.find((e) => e.id === line.edition)
        ?.stock || 0) >= line.quantity,
  );
  order.status = available ? order.outcome : 'declined';
  order.version++;
  if (order.status === 'confirmed') {
    for (const line of order.quote.lines) {
      const edition = db.nfts
        .find((n) => n.id === line.nftId)!
        .editions.find((e) => e.id === line.edition)!;
      edition.stock = Math.max(0, edition.stock - line.quantity);
      db.nfts.find((n) => n.id === line.nftId)!.version++;
      const cart = db.carts[order.userId] || [];
      const item = cart.find((i) => i.nftId === line.nftId && i.edition === line.edition);
      if (item) item.quantity = Math.max(0, item.quantity - line.quantity);
      db.carts[order.userId] = cart.filter((i) => i.quantity > 0);
    }
  }
  save();
  return true;
}
