# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> 16 regressão visual início detalhe carrinho pagamento
- Location: tests\marketplace.spec.ts:289:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 10000ms
  Failed to take two consecutive stable screenshots.

  Snapshot: detail.png

Call log:
  - Expect "toHaveScreenshot(detail.png)" with timeout 10000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 24645 pixels (ratio 0.03 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 33689 pixels (ratio 0.03 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 44741 pixels (ratio 0.04 of all image pixels) are different.
  - waiting 500ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 39602 pixels (ratio 0.04 of all image pixels) are different.
  - waiting 1000ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 33386 pixels (ratio 0.03 of all image pixels) are different.
  - waiting 1000ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 20628 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 1000ms before taking screenshot
  - Timeout 10000ms exceeded.

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - link "Pular para conteúdo" [ref=f1e3] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=f1e4]:
    - link "Kurio" [ref=f1e5] [cursor=pointer]:
      - /url: /
    - generic [ref=f1e6]:
      - link "Carrinho (1)" [ref=f1e7] [cursor=pointer]:
        - /url: /cart
        - generic [ref=f1e11]: "1"
      - link "Entrar" [ref=f1e12] [cursor=pointer]:
        - /url: /login
      - button "Abrir menu" [ref=f1e13] [cursor=pointer]
  - main [ref=f1e15]:
    - generic [ref=f1e16]:
      - link "Marketplace" [ref=f1e17] [cursor=pointer]:
        - /url: /
      - generic [ref=f1e18]: /
      - text: "Emerald Ape #042"
    - generic [ref=f1e19]:
      - generic [ref=f1e20]:
        - 'img "Emerald Ape #042" [ref=f1e21]'
        - generic [ref=f1e22]:
          - button "Ver arte completa" [pressed] [ref=f1e23] [cursor=pointer]
          - button "Ver detalhe da arte" [ref=f1e24] [cursor=pointer]
      - generic [ref=f1e25]:
        - paragraph [ref=f1e26]: Arte · Polygon
        - 'heading "Emerald Ape #042" [level=1] [ref=f1e27]'
        - paragraph [ref=f1e28]:
          - text: Criado por
          - strong [ref=f1e29]: Satoshi Studio
          - text: ✓
        - paragraph [ref=f1e30]: Uma expressão original da cultura digital. Cores, personalidade e uma história para fazer parte da sua coleção.
        - generic [ref=f1e31]:
          - text: Preço por unidade
          - strong [ref=f1e32]: 0.0125 ETH
          - paragraph [ref=f1e33]: 8 unidades disponíveis
        - generic [ref=f1e34]:
          - generic [ref=f1e35]:
            - generic [ref=f1e36]: Edição
            - combobox "Edição" [ref=f1e37]:
              - option "Original" [selected]
              - option "Edição rara — indisponível"
          - generic [ref=f1e38]:
            - generic [ref=f1e39]: Quantidade
            - spinbutton "Quantidade" [ref=f1e40]: "1"
        - generic [ref=f1e41]:
          - button "Adicionar ao carrinho" [ref=f1e42] [cursor=pointer]
          - button "Favoritar NFT" [ref=f1e46] [cursor=pointer]: Favorito
          - status
        - status [ref=f1e49]:
          - text: NFT adicionado.
          - link "Ver carrinho →" [ref=f1e50] [cursor=pointer]:
            - /url: /cart
        - group [ref=f1e51]:
          - generic "Detalhes da coleção" [ref=f1e52] [cursor=pointer]
    - generic [ref=f1e53]:
      - heading "Sobre esta obra" [level=2] [ref=f1e54]
      - paragraph [ref=f1e55]: Encontre novas perspectivas através da arte digital. Esta peça integra a coleção de Satoshi Studio no Kurio. Todos os itens desta demonstração são simulados.
    - generic [ref=f1e56]:
      - heading "Mais desta coleção" [level=2] [ref=f1e57]
      - generic [ref=f1e58]:
        - article [ref=f1e59]:
          - link [ref=f1e60] [cursor=pointer]:
            - /url: /nft/2
            - 'img "Sage Nomad #043, arte de Yuki" [ref=f1e62]'
            - generic [ref=f1e63]:
              - 'heading "Sage Nomad #043" [level=3] [ref=f1e64]'
              - strong [ref=f1e67]: 0.025 ETH
        - article [ref=f1e68]:
          - 'link "Ivory Baron #044, arte de Jungle Collective RARO Ivory Baron #044 0.0375 ETH" [ref=f1e69] [cursor=pointer]':
            - /url: /nft/3
            - generic [ref=f1e70]:
              - 'img "Ivory Baron #044, arte de Jungle Collective" [ref=f1e71]'
              - generic [ref=f1e72]: RARO
            - generic [ref=f1e73]:
              - 'heading "Ivory Baron #044" [level=3] [ref=f1e74]'
              - strong [ref=f1e77]: 0.0375 ETH
        - article [ref=f1e78]:
          - link [ref=f1e79] [cursor=pointer]:
            - /url: /nft/4
            - 'img "Golden Beat #045, arte de Pixel Lab" [ref=f1e81]'
            - generic [ref=f1e82]:
              - 'heading "Golden Beat #045" [level=3] [ref=f1e83]'
              - strong [ref=f1e86]: 0.05 ETH
        - article [ref=f1e87]:
          - link [ref=f1e88] [cursor=pointer]:
            - /url: /nft/5
            - 'img "Cosmic Bloom #046, arte de Satoshi Studio" [ref=f1e90]'
            - generic [ref=f1e91]:
              - 'heading "Cosmic Bloom #046" [level=3] [ref=f1e92]'
              - strong [ref=f1e95]: 0.0625 ETH
        - article [ref=f1e96]:
          - link [ref=f1e97] [cursor=pointer]:
            - /url: /nft/6
            - 'img "Violet Nomad #047, arte de Yuki" [ref=f1e99]'
            - generic [ref=f1e100]:
              - 'heading "Violet Nomad #047" [level=3] [ref=f1e101]'
              - strong [ref=f1e104]: 0.075 ETH
  - generic [ref=f1e105]:
    - generic [ref=f1e106]:
      - heading "Colecione com confiança" [level=3] [ref=f1e110]
      - paragraph [ref=f1e111]: Transparência em cada detalhe.
    - generic [ref=f1e112]:
      - heading "Sua coleção, suas escolhas" [level=3] [ref=f1e116]
      - paragraph [ref=f1e117]: Carteiras e redes em um só lugar.
    - generic [ref=f1e118]:
      - heading "Descubra o extraordinário" [level=3] [ref=f1e123]
      - paragraph [ref=f1e124]: Arte digital de novos criadores.
  - contentinfo [ref=f1e125]:
    - generic [ref=f1e126]:
      - link "Kurio®" [ref=f1e127] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f1e128]: Arte, comunidade e novas possibilidades.
    - navigation "Rodapé" [ref=f1e129]:
      - link "Marketplace" [ref=f1e130] [cursor=pointer]:
        - /url: /
      - link "Meu perfil" [ref=f1e131] [cursor=pointer]:
        - /url: /profile
      - link "Minhas carteiras" [ref=f1e132] [cursor=pointer]:
        - /url: /wallets
    - paragraph [ref=f1e133]: © 2026 Kurio. Projeto demonstrativo.
    - group [ref=f1e134]:
      - generic "Laboratório de demonstração" [ref=f1e135] [cursor=pointer]
      - option "normal" [selected]
      - option "slow"
      - option "race"
      - option "offline"
      - option "server-error"
      - option "expired"
      - option "favorite-error"
      - option "declined"
      - option "timeout"
      - option "pending"
  - navigation "Navegação mobile" [ref=f1e136]:
    - link "Início" [ref=f1e137] [cursor=pointer]:
      - /url: /
    - link "Meus favoritos" [ref=f1e141] [cursor=pointer]:
      - /url: /favorites
    - link "Abrir carrinho" [ref=f1e144] [cursor=pointer]:
      - /url: /cart
    - link "Abrir perfil" [ref=f1e148] [cursor=pointer]:
      - /url: /profile
```

# Test source

```ts
  195 |   await expect(page.getByRole('heading', { name: 'Secundária' })).toBeVisible();
  196 | });
  197 | test('10 Socket.IO: preço novo exige confirmação nova e eventos antigos não regridem', async ({
  198 |   page,
  199 | }) => {
  200 |   await checkout(page);
  201 |   await page.locator('.demo-panel summary').click();
  202 |   await page.getByRole('button', { name: 'Duplicar evento' }).click();
  203 |   await expect(
  204 |     page.getByRole('status').filter({ hasText: 'atualizado em tempo real' }),
  205 |   ).toBeVisible();
  206 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  207 |   await expect(page.getByRole('alert')).toContainText('Preço ou disponibilidade mudou');
  208 |   await expect(page.getByTestId('total')).toHaveText('0.751 ETH');
  209 |   await expect(page).toHaveURL(/checkout/);
  210 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  211 |   await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  212 | });
  213 | test('11 pedido pendente recupera após interrupção e refresh', async ({ page }) => {
  214 |   await page.clock.setFixedTime(new Date('2026-10-28T12:00:00Z'));
  215 |   await checkout(page);
  216 |   await demo(page, 'pending');
  217 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  218 |   await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible();
  219 |   await page.getByRole('button', { name: 'Interromper conexão' }).click();
  220 |   await page.reload();
  221 |   await expect(page).toHaveURL(/order\/GM-1/);
  222 |   await expect(page.getByRole('heading', { name: 'Pedido pendente' })).toBeVisible();
  223 |   await page.clock.setFixedTime(new Date('2026-10-28T12:01:00Z'));
  224 |   await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible({
  225 |     timeout: 30000,
  226 |   });
  227 | });
  228 | test('12 teclado e foco de diálogo', async ({ page }) => {
  229 |   await page.keyboard.press('Tab');
  230 |   await expect(page.getByText('Pular para conteúdo')).toBeFocused();
  231 |   await login(page);
  232 |   await page.goto('/wallets');
  233 |   const trigger = page.getByRole('button', { name: 'Adicionar carteira' });
  234 |   await trigger.focus();
  235 |   await page.keyboard.press('Enter');
  236 |   await expect(page.getByLabel('Nome da carteira')).toBeFocused();
  237 |   await page.keyboard.press('Shift+Tab');
  238 |   await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  239 |   await page.keyboard.press('Escape');
  240 |   await expect(trigger).toBeFocused();
  241 | });
  242 | test('13 skeleton, falha REST e recuperação', async ({ page }) => {
  243 |   await demo(page, 'slow');
  244 |   await page.goto('/nft/1');
  245 |   await expect(page.getByLabel('Carregando', { exact: true })).toBeVisible();
  246 |   await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  247 |   await demo(page, 'server-error');
  248 |   await expect(page.getByRole('alert')).toBeVisible();
  249 |   await demo(page, 'normal');
  250 |   await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  251 | });
  252 | test('14 expiração no checkout preserva contexto e carrinho', async ({ page }) => {
  253 |   await checkout(page);
  254 |   await demo(page, 'expired');
  255 |   await expect(page).toHaveURL(/login/);
  256 |   await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  257 |   await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  258 |   await page.getByRole('button', { name: 'Entrar na conta' }).click();
  259 |   await expect(page).toHaveURL(/checkout/);
  260 |   await expect(page.getByTestId('total')).toHaveText('0.0135 ETH');
  261 | });
  262 | test('15 sem overflow em 390, 768 e 1440', async ({ page }) => {
  263 |   await checkout(page);
  264 |   await page.getByRole('button', { name: 'Confirmar compra simulada' }).click();
  265 |   await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  266 |   for (const width of [390, 768, 1440]) {
  267 |     await page.setViewportSize({ width, height: 1000 });
  268 |     for (const path of [
  269 |       '/',
  270 |       '/nft/1',
  271 |       '/cart',
  272 |       '/login',
  273 |       '/register',
  274 |       '/checkout',
  275 |       '/profile',
  276 |       '/wallets',
  277 |       '/favorites',
  278 |       '/order/GM-1',
  279 |     ]) {
  280 |       await page.goto(path);
  281 |       await expect(page.locator('main')).toBeVisible();
  282 |       await expect(page.getByRole('status', { name: 'Carregando' })).toHaveCount(0);
  283 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
  284 |         true,
  285 |       );
  286 |     }
  287 |   }
  288 | });
  289 | test('16 regressão visual início detalhe carrinho pagamento', async ({ page }) => {
  290 |   await expect(page).toHaveScreenshot('home.png', {
  291 |     fullPage: true,
  292 |     animations: 'disabled',
  293 |   });
  294 |   await add(page);
> 295 |   await expect(page).toHaveScreenshot('detail.png', {
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  296 |     fullPage: true,
  297 |     animations: 'disabled',
  298 |   });
  299 |   await page.goto('/cart');
  300 |   await expect(page.getByTestId('total')).toBeVisible();
  301 |   await expect(page).toHaveScreenshot('cart.png', {
  302 |     fullPage: true,
  303 |     animations: 'disabled',
  304 |   });
  305 |   await login(page);
  306 |   await page.goto('/checkout');
  307 |   await expect(page.getByTestId('total')).toBeVisible();
  308 |   await expect(page).toHaveScreenshot('checkout.png', {
  309 |     fullPage: true,
  310 |     animations: 'disabled',
  311 |   });
  312 | });
  313 | 
```