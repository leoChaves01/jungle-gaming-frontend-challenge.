export type NFT = {
  id: string;
  name: string;
  artist: string;
  category: string;
  network: string;
  image: string;
  price: string;
  version: number;
  editions: { id: string; name: string; stock: number }[];
};
export type User = { id: string; name: string; email: string; avatar: string };
export type Wallet = {
  id: string;
  label: string;
  address: string;
  network: string;
  primary: boolean;
};
export type CartItem = { nftId: string; edition: string; quantity: number };
export type Line = CartItem & {
  name: string;
  image: string;
  price: string;
  stock: number;
};
export type Quote = {
  lines: Line[];
  subtotal: string;
  discount: string;
  fee: string;
  total: string;
  coupon: string;
  fingerprint: string;
  valid: boolean;
};
export type Order = {
  id: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'declined';
  version: number;
  quote: Quote;
  transaction: string;
  createdAt: number;
  settleAt: number;
  outcome: 'confirmed' | 'declined';
  key: string;
  payload: string;
};
export type MarketEvent = {
  id: string;
  resourceId: string;
  version: number;
  userId?: string;
};
export type Search = {
  q: string;
  category: string;
  network: string;
  sort: string;
  page: number;
  min: string;
  max: string;
};
export const wei = (value: string): bigint => {
  const [a, b = ''] = value.split('.');
  return BigInt(a) * 10n ** 18n + BigInt(b.padEnd(18, '0').slice(0, 18));
};
export const eth = (value: bigint): string =>
  `${value / 10n ** 18n}.${(value % 10n ** 18n).toString().padStart(18, '0')}`
    .replace(/0+$/, '')
    .replace(/\.$/, '');
