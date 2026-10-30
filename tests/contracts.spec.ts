import { test, expect } from '@playwright/test';
import { wei, eth } from '../src/contracts';
test('precisão decimal em wei, sem arredondamento binário', () => {
  expect(eth(wei('0.1') + wei('0.2'))).toBe('0.3');
  expect(eth(wei('0.000000000000000001') * 3n)).toBe('0.000000000000000003');
  expect(eth(wei('123456789.123456789123456789'))).toBe('123456789.123456789123456789');
});
test('MSW: chave idempotente, concorrência, conflito e autorização', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nft-card').first().waitFor();
  const results = await page.evaluate(async () => {
    const call = async (path: string, body?: unknown, key?: string) => {
      const r = await fetch('/api' + path, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', ...(key ? { 'Idempotency-Key': key } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: r.status, data: await r.json() };
    };
    const unauthorized = await call('/favorites');
    await call('/login', { email: 'ana@demo.com', password: 'Demo123!' });
    await call('/cart', { nftId: '1', edition: 'standard', quantity: 1 });
    const quote = await call('/quote');
    const payload = {
      fingerprint: quote.data.fingerprint,
      wallet: 'w1',
      network: 'Ethereum',
      name: 'Ana Silva',
      email: 'ana@demo.com',
    };
    const [first, repeat] = await Promise.all([
      call('/orders', payload, 'same-attempt'),
      call('/orders', payload, 'same-attempt'),
    ]);
    const conflict = await call('/orders', { ...payload, name: 'Different' }, 'same-attempt');
    await call('/logout', {});
    await call('/login', { email: 'bruno@demo.com', password: 'Demo123!' });
    const forbidden = await call('/orders/' + first.data.id);
    return {
      unauthorized: unauthorized.status,
      first: first.data.id,
      repeat: repeat.data.id,
      conflict: conflict.status,
      forbidden: forbidden.status,
    };
  });
  expect(results).toEqual({
    unauthorized: 401,
    first: 'GM-1',
    repeat: 'GM-1',
    conflict: 409,
    forbidden: 403,
  });
});
test('avatar persiste e carteira pode ser editada', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Entrar na conta' }).click();
  await expect(page).not.toHaveURL(/login/);
  await page.goto('/profile');
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0ioAAAAASUVORK5CYII=',
    'base64',
  );
  await page
    .getByLabel(/Alterar avatar/)
    .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(page.getByText('Perfil atualizado.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('img', { name: 'Seu avatar' })).toHaveAttribute(
    'src',
    /^data:image\/png/,
  );
  await page.goto('/wallets');
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Nome da carteira').fill('Minha principal');
  await page.getByRole('button', { name: 'Salvar carteira' }).click();
  await expect(page.getByText('Carteira salva.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /Minha principal/ })).toBeVisible();
});
test('carteira: recusa, rede incompatível e desconexão', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Entrar na conta' }).click();
  await expect(page).not.toHaveURL(/login/);
  await page.goto('/nft/1');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByText('NFT adicionado.')).toBeVisible();
  await page.goto('/checkout');
  await page.getByLabel('Simular recusa de conexão').check();
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await expect(page.getByText(/Conexão recusada pela carteira/)).toBeVisible();
  await page.getByLabel('Simular recusa de conexão').uncheck();
  await page.getByLabel('Rede de pagamento').selectOption('Polygon');
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await expect(page.getByText(/Selecione a mesma rede/)).toBeVisible();
  await page.getByLabel('Rede de pagamento').selectOption('Ethereum');
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Desconectar carteira', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Revisar pedido' })).toBeDisabled();
});
test('estoque zerado por Socket.IO impede compra', async ({ page }) => {
  await page.goto('/nft/1');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByText('NFT adicionado.')).toBeVisible();
  await page.goto('/cart');
  await page.locator('.demo-panel summary').click();
  await page.getByRole('button', { name: 'Esgotar NFT 1' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'atualizado em tempo real' }),
  ).toBeVisible();
  await expect(
    page.getByText('Quantidade indisponível. Ajuste ou remova este item.'),
  ).toBeVisible();
  await expect(page.getByLabel('Quantidade de Emerald Ape #042')).toHaveAttribute('max', '0');
});
test('respostas fora de ordem, preço na URL e recuperação de conexão', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nft-card').first().waitFor();
  await page.locator('.demo-panel summary').click();
  await page.getByLabel('Cenário', { exact: true }).selectOption('race');
  await page.getByRole('button', { name: 'Aplicar cenário', exact: true }).click();
  await expect(page.getByText('Cenário atualizado.')).toBeVisible();
  await page.getByLabel('Buscar NFTs').fill('b');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByLabel('Buscar NFTs').fill('Ivory');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.locator('.nft-card')).toHaveCount(4);
  await expect(page.locator('.nft-card').first()).toContainText('Ivory Baron');
  await page.reload();
  await expect(page.getByLabel('Buscar NFTs')).toHaveValue('Ivory');
  if (await page.getByRole('button', { name: 'Filtros', exact: true }).isVisible())
    await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  await page.locator('.precise-prices summary').click();
  await page.getByLabel('Preço mínimo (ETH)').fill('1.8');
  await expect(page.locator('.nft-card')).toHaveCount(3);
  await expect(page).toHaveURL((url) => JSON.parse(url.searchParams.get('min')!) === '1.8');
  await page.locator('.demo-panel summary').click();
  await page.getByLabel('Cenário', { exact: true }).selectOption('offline');
  await page.getByRole('button', { name: 'Aplicar cenário', exact: true }).click();
  await expect(page.getByRole('alert').first()).toContainText('Sem conexão');
  await page.getByLabel('Cenário', { exact: true }).selectOption('normal');
  await page.getByRole('button', { name: 'Aplicar cenário', exact: true }).click();
  await expect(page.locator('.nft-card')).toHaveCount(3);
});
