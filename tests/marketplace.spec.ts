import { test, expect, type Page } from '@playwright/test';
async function demo(page: Page, scenario: string) {
  const details = page.locator('.demo-panel');
  if ((await details.getAttribute('open')) === null) await details.locator('summary').click();
  await page.getByLabel('Cenário', { exact: true }).selectOption(scenario);
  await page.getByRole('button', { name: 'Aplicar cenário', exact: true }).click();
  await expect(page.getByText('Cenário atualizado.')).toBeVisible();
}
async function login(page: Page, email = 'ana@demo.com', password = 'Demo123!') {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar na conta' }).click();
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
}
async function add(page: Page, id = '1') {
  await page.goto('/nft/' + id);
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByText('NFT adicionado.')).toBeVisible();
}
async function checkout(page: Page) {
  await login(page);
  await add(page);
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  await page.getByRole('button', { name: 'Revisar pedido' }).click();
  await expect(page.getByRole('heading', { name: 'Revise seu pedido' })).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Explore o marketplace' })).toBeVisible();
  await page.locator('.nft-card').first().waitFor();
});
test('01 catálogo: busca, filtros combinados, ordenação, paginação e histórico', async ({
  page,
}) => {
  await expect(page.locator('.nft-card')).toHaveCount(8);
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  if (await page.getByRole('button', { name: 'Filtros', exact: true }).isVisible())
    await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  await page.getByLabel('Categoria', { exact: true }).selectOption('Arte');
  await expect(page).not.toHaveURL(/page=2/);
  await page.getByLabel('Rede', { exact: true }).selectOption('Ethereum');
  await page.getByLabel('Ordenar por').selectOption('high');
  await expect(page.locator('.nft-card')).toHaveCount(5);
  await page.reload();
  await expect(page.getByLabel('Categoria', { exact: true })).toHaveValue('Arte');
  await page.getByLabel('Buscar NFTs').fill('inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByText('Nenhum NFT encontrado')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.nft-card')).toHaveCount(5);
});
test('02 detalhe direto, edição indisponível, limite e 404', async ({ page }) => {
  await page.goto('/nft/1');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  await page.getByLabel('Edição', { exact: true }).selectOption('rare');
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
  await page.getByLabel('Edição', { exact: true }).selectOption('standard');
  await page.getByLabel('Quantidade', { exact: true }).fill('99');
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
  await page.goto('/nft/404');
  await expect(page.getByRole('alert')).toContainText('NFT não encontrado');
  await page.goto('/nada');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
});
test('03 cadastro, conflito, login e sessão persistente', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Nome completo').fill('Nova Pessoa');
  await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByRole('alert')).toContainText('já está cadastrado');
  await page.getByLabel('E-mail', { exact: true }).fill('nova@demo.com');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await login(page, 'nova@demo.com');
});
test('04 favoritos otimistas: rollback, persistência e isolamento', async ({ page }) => {
  await login(page);
  await page.goto('/nft/1');
  await demo(page, 'favorite-error');
  await page.getByRole('button', { name: 'Favoritar NFT' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível');
  await expect(page.getByRole('button', { name: 'Favoritar NFT' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await demo(page, 'normal');
  await page.getByRole('button', { name: 'Favoritar NFT' }).click();
  await expect(page.getByRole('button', { name: 'Favoritar NFT' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Favoritar NFT' })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Favoritar NFT' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await login(page, 'bruno@demo.com');
  await page.goto('/favorites');
  await expect(page.getByText(/Você ainda não tem favoritos/)).toBeVisible();
});
test('05 carrinho: quantidades, cupom, refresh, login e remoção', async ({ page }) => {
  await add(page);
  await page.goto('/cart');
  await page.getByLabel('Quantidade de Emerald Ape #042').fill('2');
  await expect(page.getByTestId('total')).toHaveText('0.026 ETH');
  await page.getByLabel('Cupom de desconto').fill('EXPIRED');
  await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('expirado');
  await page.getByLabel('Cupom de desconto').fill('JUNGLE10');
  await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).click();
  await expect(page.getByTestId('total')).toHaveText('0.0235 ETH');
  await page.getByRole('button', { name: 'Remover cupom' }).click();
  await expect(page.getByTestId('total')).toHaveText('0.026 ETH');
  await page.reload();
  await expect(page.getByLabel('Quantidade de Emerald Ape #042')).toHaveValue('2');
  await login(page);
  await page.goto('/cart');
  await expect(page.getByLabel('Quantidade de Emerald Ape #042')).toHaveValue('2');
  await page.getByRole('button', { name: 'Remover', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
});
test('06 compra completa e recibo imutável', async ({ page }) => {
  await checkout(page);
  await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  const url = page.url();
  await expect(page.getByTestId('total')).toHaveText('0.0135 ETH');
  await page.locator('.demo-panel summary').click();
  await page.getByRole('button', { name: 'Alterar preço NFT 1' }).click();
  await expect(page.getByTestId('total')).toHaveText('0.0135 ETH');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await login(page, 'bruno@demo.com');
  await page.goto(url);
  await expect(page.getByRole('alert')).toContainText('Acesso não permitido');
});
test('07 pagamento recusado preserva itens', async ({ page }) => {
  await checkout(page);
  await demo(page, 'declined');
  await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible();
  await page.goto('/cart');
  await expect(page.getByLabel('Quantidade de Emerald Ape #042')).toHaveValue('1');
});
test('08 timeout e reenvio recuperam o mesmo pedido', async ({ page }) => {
  await checkout(page);
  await demo(page, 'timeout');
  await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  await expect(page.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('demorou');
  await page.reload();
  await page.getByRole('button', { name: 'Recuperar mesma tentativa' }).click();
  await expect(page).toHaveURL(/order\/GM-1/);
  await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
});
test('09 perfil, senha, validação e carteira', async ({ page }) => {
  await login(page);
  await page.goto('/profile');
  await page.getByLabel('Nome completo').fill('Ana Colecionadora');
  await page.getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(page.getByText('Perfil atualizado.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nome completo')).toHaveValue('Ana Colecionadora');
  await page.getByLabel('Senha atual', { exact: true }).fill('incorreta');
  await page.getByLabel('Nova senha', { exact: true }).fill('Nova1234!');
  await page.getByLabel('Confirmar nova senha', { exact: true }).fill('Nova1234!');
  await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Senha atual incorreta');
  await page.getByLabel('Senha atual', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
  await expect(page.getByText('Senha alterada com sucesso.')).toBeVisible();
  await page.goto('/wallets');
  await page.getByRole('button', { name: 'Adicionar carteira' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Nome da carteira').fill('Secundária');
  await page.getByLabel('Endereço da carteira').fill('0x' + 'a'.repeat(40));
  await page.getByLabel('Rede da carteira').selectOption('Polygon');
  await page.getByRole('button', { name: 'Salvar carteira' }).click();
  await expect(page.getByText('Carteira salva.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Secundária' })).toBeVisible();
});
test('10 Socket.IO: preço novo exige confirmação nova e eventos antigos não regridem', async ({
  page,
}) => {
  await checkout(page);
  await page.locator('.demo-panel summary').click();
  await page.getByRole('button', { name: 'Duplicar evento' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'atualizado em tempo real' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  await expect(page.getByRole('alert')).toContainText('Preço ou disponibilidade mudou');
  await expect(page.getByTestId('total')).toHaveText('0.751 ETH');
  await expect(page).toHaveURL(/checkout/);
  await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
});
test('11 pedido pendente recupera após interrupção e refresh', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-28T12:00:00Z'));
  await checkout(page);
  await demo(page, 'pending');
  await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible();
  await page.getByRole('button', { name: 'Interromper conexão' }).click();
  await page.reload();
  await expect(page).toHaveURL(/order\/GM-1/);
  await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible();
  await page.clock.setFixedTime(new Date('2026-10-28T12:01:00Z'));
  await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible({
    timeout: 30000,
  });
});
test('12 teclado e foco de diálogo', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByText('Pular para conteúdo')).toBeFocused();
  await login(page);
  await page.goto('/wallets');
  const trigger = page.getByRole('button', { name: 'Adicionar carteira' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Nome da carteira')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});
test('13 skeleton, falha REST e recuperação', async ({ page }) => {
  await demo(page, 'slow');
  await page.goto('/nft/1');
  await expect(page.getByLabel('Carregando', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  await demo(page, 'server-error');
  await expect(page.getByRole('alert')).toBeVisible();
  await demo(page, 'normal');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
});
test('14 expiração no checkout preserva contexto e carrinho', async ({ page }) => {
  await checkout(page);
  await demo(page, 'expired');
  await expect(page).toHaveURL(/login/);
  await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Entrar na conta' }).click();
  await expect(page).toHaveURL(/checkout/);
  await expect(page.getByTestId('total')).toHaveText('0.0135 ETH');
});
test('15 sem overflow em 390, 768 e 1440', async ({ page }) => {
  await checkout(page);
  await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      '/',
      '/nft/1',
      '/cart',
      '/login',
      '/register',
      '/checkout',
      '/profile',
      '/wallets',
      '/favorites',
      '/order/GM-1',
    ]) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      await expect(page.getByRole('status', { name: 'Carregando' })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
});
test('16 regressão visual início detalhe carrinho pagamento', async ({ page }) => {
  const prepareScreenshot = async () => {
    // Load offscreen artwork through normal scrolling, then capture from a stable origin.
    await page.mouse.move(0, 0);
    for (const img of await page.locator('main img').all()) {
      await img.evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
      await expect(img).toHaveJSProperty('complete', true);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  };
  await prepareScreenshot();
  await expect(page).toHaveScreenshot('home.png', {
    fullPage: true,
    animations: 'disabled',
  });
  await add(page);
  await expect(page.locator('.related-collection .nft-card')).toHaveCount(5);
  await prepareScreenshot();
  await expect(page).toHaveScreenshot('detail.png', {
    fullPage: true,
    animations: 'disabled',
  });
  await page.goto('/cart');
  await expect(page.getByTestId('total')).toBeVisible();
  await prepareScreenshot();
  await expect(page).toHaveScreenshot('cart.png', {
    fullPage: true,
    animations: 'disabled',
  });
  await login(page);
  await page.goto('/checkout');
  await expect(page.getByTestId('total')).toBeVisible();
  await prepareScreenshot();
  await expect(page).toHaveScreenshot('checkout.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
