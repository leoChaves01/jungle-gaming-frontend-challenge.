# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> 08 timeout e reenvio recuperam o mesmo pedido
- Location: tests\marketplace.spec.ts:157:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Pedido pendente' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Pedido pendente' }) with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Pedido pendente' })

```

```yaml
- link "Pular para conteúdo":
  - /url: "#main"
- text: Uma nova forma de colecionar. Ambiente demonstrativo • sem pagamentos reais
- banner:
  - link "Kurio":
    - /url: /
  - navigation "Principal":
    - link "Explorar":
      - /url: /
    - link "Favoritos":
      - /url: /favorites
    - link "Carteiras":
      - /url: /wallets
    - link "Minha conta":
      - /url: /profile
  - link "Carrinho (0)":
    - /url: /cart
    - text: "0"
  - button "Sair"
- main:
  - status:
    - paragraph: KURIO MARKETPLACE
    - heading "Pedido confirmado!" [level=1]
    - paragraph: Sua nova coleção está esperando por você.
    - paragraph:
      - text: Pedido
      - strong: GM-1
  - heading "Seus NFTs" [level=2]
  - 'img "Bored Jungle #100"'
  - 'heading "Bored Jungle #100" [level=3]'
  - paragraph: 1 × 0.0125 ETH
  - heading "Transação simulada" [level=3]
  - paragraph: SIM-1e60d9bb-5626-4c12-8460-4133d8876ae3
  - group: Ver referência da simulação
  - link "Continuar explorando":
    - /url: /
  - complementary:
    - heading "Resumo do pedido" [level=2]
    - term: Subtotal
    - definition: 0.0125 ETH
    - term: Desconto
    - definition: −0 ETH
    - term: Taxa de rede
    - definition: 0.001 ETH
    - term: Total
    - definition: 0.0135 ETH
    - paragraph: Transação 100% simulada
- heading "Colecione com confiança" [level=3]
- paragraph: Transparência em cada detalhe.
- heading "Sua coleção, suas escolhas" [level=3]
- paragraph: Carteiras e redes em um só lugar.
- heading "Descubra o extraordinário" [level=3]
- paragraph: Arte digital de novos criadores.
- contentinfo:
  - link "Kurio®":
    - /url: /
  - paragraph: Arte, comunidade e novas possibilidades.
  - navigation "Rodapé":
    - link "Marketplace":
      - /url: /
    - link "Meu perfil":
      - /url: /profile
    - link "Minhas carteiras":
      - /url: /wallets
  - paragraph: © 2026 Kurio. Projeto demonstrativo.
  - group: Laboratório de demonstração
```

# Test source

```ts
  66  | });
  67  | test('03 cadastro, conflito, login e sessão persistente', async ({ page }) => {
  68  |   await page.goto('/register');
  69  |   await page.getByLabel('Nome completo').fill('Nova Pessoa');
  70  |   await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  71  |   await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  72  |   await page.getByLabel('Confirmar senha', { exact: true }).fill('Demo123!');
  73  |   await page.getByRole('button', { name: 'Criar conta' }).click();
  74  |   await expect(page.getByRole('alert')).toContainText('já está cadastrado');
  75  |   await page.getByLabel('E-mail', { exact: true }).fill('nova@demo.com');
  76  |   await page.getByRole('button', { name: 'Criar conta' }).click();
  77  |   await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  78  |   await page.reload();
  79  |   await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  80  |   await page.getByRole('button', { name: 'Sair', exact: true }).click();
  81  |   await login(page, 'nova@demo.com');
  82  | });
  83  | test('04 favoritos otimistas: rollback, persistência e isolamento', async ({ page }) => {
  84  |   await login(page);
  85  |   await page.goto('/nft/1');
  86  |   await demo(page, 'favorite-error');
  87  |   await page.getByRole('button', { name: 'Favoritar NFT' }).click();
  88  |   await expect(page.getByRole('alert')).toContainText('Não foi possível');
  89  |   await expect(page.getByRole('button', { name: 'Favoritar NFT' })).toHaveAttribute(
  90  |     'aria-pressed',
  91  |     'false',
  92  |   );
  93  |   await demo(page, 'normal');
  94  |   await page.getByRole('button', { name: 'Favoritar NFT' }).click();
  95  |   await expect(page.getByRole('button', { name: 'Favoritar NFT' })).toHaveAttribute(
  96  |     'aria-pressed',
  97  |     'true',
  98  |   );
  99  |   await expect(page.getByRole('button', { name: 'Favoritar NFT' })).toBeEnabled();
  100 |   await page.reload();
  101 |   await expect(page.getByRole('button', { name: 'Favoritar NFT' })).toHaveAttribute(
  102 |     'aria-pressed',
  103 |     'true',
  104 |   );
  105 |   await page.getByRole('button', { name: 'Sair', exact: true }).click();
  106 |   await login(page, 'bruno@demo.com');
  107 |   await page.goto('/favorites');
  108 |   await expect(page.getByText(/Você ainda não tem favoritos/)).toBeVisible();
  109 | });
  110 | test('05 carrinho: quantidades, cupom, refresh, login e remoção', async ({ page }) => {
  111 |   await add(page);
  112 |   await page.goto('/cart');
  113 |   await page.getByLabel('Quantidade de Bored Jungle #100').fill('2');
  114 |   await expect(page.getByTestId('total')).toHaveText('0.026 ETH');
  115 |   await page.getByLabel('Cupom de desconto').fill('EXPIRED');
  116 |   await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).click();
  117 |   await expect(page.getByRole('alert')).toContainText('expirado');
  118 |   await page.getByLabel('Cupom de desconto').fill('JUNGLE10');
  119 |   await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).click();
  120 |   await expect(page.getByTestId('total')).toHaveText('0.0235 ETH');
  121 |   await page.getByRole('button', { name: 'Remover cupom' }).click();
  122 |   await expect(page.getByTestId('total')).toHaveText('0.026 ETH');
  123 |   await page.reload();
  124 |   await expect(page.getByLabel('Quantidade de Bored Jungle #100')).toHaveValue('2');
  125 |   await login(page);
  126 |   await page.goto('/cart');
  127 |   await expect(page.getByLabel('Quantidade de Bored Jungle #100')).toHaveValue('2');
  128 |   await page.getByRole('button', { name: 'Remover', exact: true }).click();
  129 |   await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
  130 | });
  131 | test('06 compra completa e recibo imutável', async ({ page }) => {
  132 |   await checkout(page);
  133 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  134 |   await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  135 |   const url = page.url();
  136 |   await expect(page.getByTestId('total')).toHaveText('0.0135 ETH');
  137 |   await page.locator('.demo-panel summary').click();
  138 |   await page.getByRole('button', { name: 'Alterar preço NFT 1' }).click();
  139 |   await expect(page.getByTestId('total')).toHaveText('0.0135 ETH');
  140 |   await page.reload();
  141 |   await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  142 |   await page.goto('/cart');
  143 |   await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible();
  144 |   await page.getByRole('button', { name: 'Sair', exact: true }).click();
  145 |   await login(page, 'bruno@demo.com');
  146 |   await page.goto(url);
  147 |   await expect(page.getByRole('alert')).toContainText('Acesso não permitido');
  148 | });
  149 | test('07 pagamento recusado preserva itens', async ({ page }) => {
  150 |   await checkout(page);
  151 |   await demo(page, 'declined');
  152 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  153 |   await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible();
  154 |   await page.goto('/cart');
  155 |   await expect(page.getByLabel('Quantidade de Bored Jungle #100')).toHaveValue('1');
  156 | });
  157 | test('08 timeout e reenvio recuperam o mesmo pedido', async ({ page }) => {
  158 |   await checkout(page);
  159 |   await demo(page, 'timeout');
  160 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  161 |   await expect(page.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  162 |   await expect(page.getByRole('alert')).toContainText('demorou');
  163 |   await page.reload();
  164 |   await page.getByRole('button', { name: 'Recuperar mesma tentativa' }).click();
  165 |   await expect(page).toHaveURL(/order\/GM-1/);
> 166 |   await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  167 | });
  168 | test('09 perfil, senha, validação e carteira', async ({ page }) => {
  169 |   await login(page);
  170 |   await page.goto('/profile');
  171 |   await page.getByLabel('Nome completo').fill('Ana Colecionadora');
  172 |   await page.getByRole('button', { name: 'Salvar perfil' }).click();
  173 |   await expect(page.getByText('Perfil atualizado.')).toBeVisible();
  174 |   await page.reload();
  175 |   await expect(page.getByLabel('Nome completo')).toHaveValue('Ana Colecionadora');
  176 |   await page.getByLabel('Senha atual', { exact: true }).fill('incorreta');
  177 |   await page.getByLabel('Nova senha', { exact: true }).fill('Nova1234!');
  178 |   await page.getByLabel('Confirmar nova senha', { exact: true }).fill('Nova1234!');
  179 |   await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
  180 |   await expect(page.getByRole('alert')).toContainText('Senha atual incorreta');
  181 |   await page.getByLabel('Senha atual', { exact: true }).fill('Demo123!');
  182 |   await page.getByRole('button', { name: 'Alterar senha', exact: true }).click();
  183 |   await expect(page.getByText('Senha alterada com sucesso.')).toBeVisible();
  184 |   await page.goto('/wallets');
  185 |   await page.getByRole('button', { name: 'Adicionar carteira' }).click();
  186 |   await expect(page.getByRole('dialog')).toBeVisible();
  187 |   await page.getByLabel('Nome da carteira').fill('Secundária');
  188 |   await page.getByLabel('Endereço da carteira').fill('0x' + 'a'.repeat(40));
  189 |   await page.getByLabel('Rede da carteira').selectOption('Polygon');
  190 |   await page.getByRole('button', { name: 'Salvar carteira' }).click();
  191 |   await expect(page.getByText('Carteira salva.')).toBeVisible();
  192 |   await page.reload();
  193 |   await expect(page.getByRole('heading', { name: 'Secundária' })).toBeVisible();
  194 | });
  195 | test('10 Socket.IO: preço novo exige confirmação nova e eventos antigos não regridem', async ({
  196 |   page,
  197 | }) => {
  198 |   await checkout(page);
  199 |   await page.locator('.demo-panel summary').click();
  200 |   await page.getByRole('button', { name: 'Duplicar evento' }).click();
  201 |   await expect(
  202 |     page.getByRole('status').filter({ hasText: 'atualizado em tempo real' }),
  203 |   ).toBeVisible();
  204 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  205 |   await expect(page.getByRole('alert')).toContainText('Preço ou disponibilidade mudou');
  206 |   await expect(page.getByTestId('total')).toHaveText('0.751 ETH');
  207 |   await expect(page).toHaveURL(/checkout/);
  208 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  209 |   await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  210 | });
  211 | test('11 pedido pendente recupera após interrupção e refresh', async ({ page }) => {
  212 |   await page.clock.setFixedTime(new Date('2026-10-28T12:00:00Z'));
  213 |   await checkout(page);
  214 |   await demo(page, 'pending');
  215 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  216 |   await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible();
  217 |   await page.getByRole('button', { name: 'Interromper conexão' }).click();
  218 |   await page.reload();
  219 |   await expect(page).toHaveURL(/order\/GM-1/);
  220 |   await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible();
  221 |   await page.clock.setFixedTime(new Date('2026-10-28T12:01:00Z'));
  222 |   await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible({
  223 |     timeout: 30000,
  224 |   });
  225 | });
  226 | test('12 teclado e foco de diálogo', async ({ page }) => {
  227 |   await page.keyboard.press('Tab');
  228 |   await expect(page.getByText('Pular para conteúdo')).toBeFocused();
  229 |   await login(page);
  230 |   await page.goto('/wallets');
  231 |   const trigger = page.getByRole('button', { name: 'Adicionar carteira' });
  232 |   await trigger.focus();
  233 |   await page.keyboard.press('Enter');
  234 |   await expect(page.getByLabel('Nome da carteira')).toBeFocused();
  235 |   await page.keyboard.press('Shift+Tab');
  236 |   await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  237 |   await page.keyboard.press('Escape');
  238 |   await expect(trigger).toBeFocused();
  239 | });
  240 | test('13 skeleton, falha REST e recuperação', async ({ page }) => {
  241 |   await demo(page, 'slow');
  242 |   await page.goto('/nft/1');
  243 |   await expect(page.getByLabel('Carregando', { exact: true })).toBeVisible();
  244 |   await expect(page.getByRole('heading', { name: 'Bored Jungle #100' })).toBeVisible();
  245 |   await demo(page, 'server-error');
  246 |   await expect(page.getByRole('alert')).toBeVisible();
  247 |   await demo(page, 'normal');
  248 |   await expect(page.getByRole('heading', { name: 'Bored Jungle #100' })).toBeVisible();
  249 | });
  250 | test('14 expiração no checkout preserva contexto e carrinho', async ({ page }) => {
  251 |   await checkout(page);
  252 |   await demo(page, 'expired');
  253 |   await expect(page).toHaveURL(/login/);
  254 |   await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  255 |   await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  256 |   await page.getByRole('button', { name: 'Entrar na conta' }).click();
  257 |   await expect(page).toHaveURL(/checkout/);
  258 |   await expect(page.getByTestId('total')).toHaveText('0.0135 ETH');
  259 | });
  260 | test('15 sem overflow em 390, 768 e 1440', async ({ page }) => {
  261 |   for (const width of [390, 768, 1440]) {
  262 |     await page.setViewportSize({ width, height: 1000 });
  263 |     for (const path of ['/', '/nft/1', '/cart', '/login']) {
  264 |       await page.goto(path);
  265 |       await expect(page.locator('main')).toBeVisible();
  266 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
```