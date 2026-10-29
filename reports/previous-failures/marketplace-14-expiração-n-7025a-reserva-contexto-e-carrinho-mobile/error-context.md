# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> 14 expiração no checkout preserva contexto e carrinho
- Location: tests\marketplace.spec.ts:320:1

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: locator.click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Confirmar compra simulada' })
    - locator resolved to <button class="inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50 disabled:pointer-events-none bg-violet-600 text-white hover:bg-violet-700 px-6 py-3">Confirmar compra simulada</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - <html lang="pt-BR">…</html> intercepts pointer events
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=f3e2]:
  - link "Pular para conteúdo" [ref=f3e3] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=f3e4]: Uma nova forma de colecionar.
  - banner [ref=f3e5]:
    - link "G GreenMint ®" [ref=f3e6] [cursor=pointer]:
      - /url: /
      - generic [ref=f3e7]: G
      - text: GreenMint
      - generic [ref=f3e8]: ®
    - generic [ref=f3e9]:
      - link "Carrinho (0)" [ref=f3e10] [cursor=pointer]:
        - /url: /cart
        - generic [ref=f3e14]: "0"
      - link "Entrar" [ref=f3e15] [cursor=pointer]:
        - /url: /login
      - button "Abrir menu" [ref=f3e16] [cursor=pointer]
  - main [ref=f3e18]:
    - generic [ref=f3e19]:
      - generic [ref=f3e20]:
        - paragraph [ref=f3e21]: BEM-VINDO AO GREENMINT
        - heading [level=1] [ref=f3e22]:
          - text: Sua coleção. Sua identidade.
          - emphasis [ref=f3e23]: Seu universo.
        - paragraph [ref=f3e24]: Conecte-se à próxima geração de colecionadores.
      - generic [ref=f3e25]:
        - heading "Bom ter você de volta" [level=2] [ref=f3e26]
        - paragraph [ref=f3e27]: Entre para continuar sua jornada.
        - generic [ref=f3e28]:
          - generic [ref=f3e29]: E-mail
          - textbox "E-mail" [ref=f3e30]
        - generic [ref=f3e31]:
          - generic [ref=f3e32]: Senha
          - textbox "Senha" [ref=f3e33]
        - paragraph [ref=f3e34]: "Use pelo menos 8 caracteres. Demo: ana@demo.com / Demo123!"
        - button "Entrar na conta" [ref=f3e35] [cursor=pointer]
        - paragraph [ref=f3e36]:
          - text: Ainda não tem uma conta?
          - link "Cadastre-se" [ref=f3e37] [cursor=pointer]:
            - /url: /register
  - generic [ref=f3e38]:
    - generic [ref=f3e39]:
      - heading "Colecione com confiança" [level=3] [ref=f3e43]
      - paragraph [ref=f3e44]: Transparência em cada detalhe.
    - generic [ref=f3e45]:
      - heading "Sua coleção, suas escolhas" [level=3] [ref=f3e49]
      - paragraph [ref=f3e50]: Carteiras e redes em um só lugar.
    - generic [ref=f3e51]:
      - heading "Descubra o extraordinário" [level=3] [ref=f3e56]
      - paragraph [ref=f3e57]: Arte digital de novos criadores.
  - contentinfo [ref=f3e58]:
    - generic [ref=f3e59]:
      - link "GreenMint®" [ref=f3e60] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f3e61]: Arte, comunidade e novas possibilidades.
    - navigation "Rodapé" [ref=f3e62]:
      - link "Marketplace" [ref=f3e63] [cursor=pointer]:
        - /url: /
      - link "Meu perfil" [ref=f3e64] [cursor=pointer]:
        - /url: /profile
      - link "Minhas carteiras" [ref=f3e65] [cursor=pointer]:
        - /url: /wallets
    - paragraph [ref=f3e66]: © 2026 GreenMint. Projeto demonstrativo.
    - group [ref=f3e67]:
      - generic "Laboratório de demonstração" [ref=f3e68] [cursor=pointer]
      - paragraph [ref=f3e69]: Controles reproduzíveis dos mocks. Alterações de NFT são enviadas por Socket.IO.
      - generic [ref=f3e70]:
        - generic [ref=f3e71]: Cenário
        - combobox "Cenário" [ref=f3e72]:
          - option "normal"
          - option "slow"
          - option "race"
          - option "offline"
          - option "server-error"
          - option "expired" [selected]
          - option "favorite-error"
          - option "declined"
          - option "timeout"
          - option "pending"
      - generic [ref=f3e73]:
        - button "Aplicar cenário" [active] [ref=f3e74] [cursor=pointer]
        - button "Alterar preço NFT 1" [ref=f3e75] [cursor=pointer]
        - button "Esgotar NFT 1" [ref=f3e76] [cursor=pointer]
        - button "Duplicar evento" [ref=f3e77] [cursor=pointer]
        - button "Interromper conexão" [ref=f3e78] [cursor=pointer]
        - button "Resetar demonstração" [ref=f3e79] [cursor=pointer]
      - status [ref=f3e80]: Cenário atualizado.
```

# Test source

```ts
  225 |   await page.getByRole("button", { name: "Salvar perfil" }).click();
  226 |   await expect(page.getByText("Perfil atualizado.")).toBeVisible();
  227 |   await page.reload();
  228 |   await expect(page.getByLabel("Nome completo")).toHaveValue(
  229 |     "Ana Colecionadora",
  230 |   );
  231 |   await page.getByLabel("Senha atual", { exact: true }).fill("incorreta");
  232 |   await page.getByLabel("Nova senha", { exact: true }).fill("Nova1234!");
  233 |   await page
  234 |     .getByLabel("Confirmar nova senha", { exact: true })
  235 |     .fill("Nova1234!");
  236 |   await page
  237 |     .getByRole("button", { name: "Alterar senha", exact: true })
  238 |     .click();
  239 |   await expect(page.getByRole("alert")).toContainText("Senha atual incorreta");
  240 |   await page.getByLabel("Senha atual", { exact: true }).fill("Demo123!");
  241 |   await page
  242 |     .getByRole("button", { name: "Alterar senha", exact: true })
  243 |     .click();
  244 |   await expect(page.getByText("Senha alterada com sucesso.")).toBeVisible();
  245 |   await page.goto("/wallets");
  246 |   await page.getByRole("button", { name: "Adicionar carteira" }).click();
  247 |   await expect(page.getByRole("dialog")).toBeVisible();
  248 |   await page.getByLabel("Nome da carteira").fill("Secundária");
  249 |   await page.getByLabel("Endereço da carteira").fill("0x" + "a".repeat(40));
  250 |   await page.getByLabel("Rede da carteira").selectOption("Polygon");
  251 |   await page.getByRole("button", { name: "Salvar carteira" }).click();
  252 |   await expect(page.getByText("Carteira salva.")).toBeVisible();
  253 |   await page.reload();
  254 |   await expect(page.getByRole("heading", { name: "Secundária" })).toBeVisible();
  255 | });
  256 | test("10 Socket.IO: preço novo exige confirmação nova e eventos antigos não regridem", async ({
  257 |   page,
  258 | }) => {
  259 |   await checkout(page);
  260 |   await page.locator(".demo-panel summary").click();
  261 |   await page.getByRole("button", { name: "Duplicar evento" }).click();
  262 |   await expect(
  263 |     page.getByRole("status").filter({ hasText: "atualizado em tempo real" }),
  264 |   ).toBeVisible();
  265 |   await page.getByRole("button", { name: "Confirmar compra simulada" }).click();
  266 |   await expect(page.getByRole("alert")).toContainText(
  267 |     "Preço ou disponibilidade mudou",
  268 |   );
  269 |   await expect(page.getByTestId("total")).toHaveText("0.751 ETH");
  270 |   await expect(page).toHaveURL(/checkout/);
  271 |   await page.getByRole("button", { name: "Confirmar compra simulada" }).click();
  272 |   await expect(
  273 |     page.getByRole("heading", { name: "Pedido confirmado!" }),
  274 |   ).toBeVisible();
  275 | });
  276 | test("11 pedido pendente recupera após interrupção e refresh", async ({
  277 |   page,
  278 | }) => {
  279 |   await checkout(page);
  280 |   await demo(page, "pending");
  281 |   await page.getByRole("button", { name: "Confirmar compra simulada" }).click();
  282 |   await expect(
  283 |     page.getByRole("heading", { name: "Pedido pendente" }),
  284 |   ).toBeVisible();
  285 |   await page.getByRole("button", { name: "Interromper conexão" }).click();
  286 |   await page.reload();
  287 |   await expect(page).toHaveURL(/order\/GM-1/);
  288 |   await expect(
  289 |     page.getByRole("heading", { name: "Pedido confirmado!" }),
  290 |   ).toBeVisible({ timeout: 30000 });
  291 | });
  292 | test("12 teclado e foco de diálogo", async ({ page }) => {
  293 |   await page.keyboard.press("Tab");
  294 |   await expect(page.getByText("Pular para conteúdo")).toBeFocused();
  295 |   await login(page);
  296 |   await page.goto("/wallets");
  297 |   const trigger = page.getByRole("button", { name: "Adicionar carteira" });
  298 |   await trigger.focus();
  299 |   await page.keyboard.press("Enter");
  300 |   await expect(page.getByLabel("Nome da carteira")).toBeFocused();
  301 |   await page.keyboard.press("Shift+Tab");
  302 |   await expect(page.getByRole("button", { name: "Cancelar" })).toBeFocused();
  303 |   await page.keyboard.press("Escape");
  304 |   await expect(trigger).toBeFocused();
  305 | });
  306 | test("13 skeleton, falha REST e recuperação", async ({ page }) => {
  307 |   await demo(page, "slow");
  308 |   await page.goto("/nft/1");
  309 |   await expect(page.getByLabel("Carregando", { exact: true })).toBeVisible();
  310 |   await expect(
  311 |     page.getByRole("heading", { name: "Bored Jungle #100" }),
  312 |   ).toBeVisible();
  313 |   await demo(page, "server-error");
  314 |   await expect(page.getByRole("alert")).toBeVisible();
  315 |   await demo(page, "normal");
  316 |   await expect(
  317 |     page.getByRole("heading", { name: "Bored Jungle #100" }),
  318 |   ).toBeVisible();
  319 | });
  320 | test("14 expiração no checkout preserva contexto e carrinho", async ({
  321 |   page,
  322 | }) => {
  323 |   await checkout(page);
  324 |   await demo(page, "expired");
> 325 |   await expect(page).toHaveURL(/login/);
      |                                                                         ^ Error: locator.click: Test timeout of 45000ms exceeded.
  326 |   await page.getByLabel("E-mail", { exact: true }).fill("ana@demo.com");
  327 |   await page.getByLabel("Senha", { exact: true }).fill("Demo123!");
  328 |   await page.getByRole("button", { name: "Entrar na conta" }).click();
  329 |   await expect(page).toHaveURL(/checkout/);
  330 |   await expect(page.getByTestId("total")).toHaveText("0.0135 ETH");
  331 | });
  332 | test("15 sem overflow em 390, 768 e 1440", async ({ page }) => {
  333 |   for (const width of [390, 768, 1440]) {
  334 |     await page.setViewportSize({ width, height: 1000 });
  335 |     for (const path of ["/", "/nft/1", "/cart", "/login"]) {
  336 |       await page.goto(path);
  337 |       await expect(page.locator("main")).toBeVisible();
  338 |       expect(
  339 |         await page.evaluate(
  340 |           () => document.documentElement.scrollWidth <= innerWidth,
  341 |         ),
  342 |       ).toBe(true);
  343 |     }
  344 |   }
  345 | });
  346 | test("16 regressão visual início detalhe carrinho pagamento", async ({
  347 |   page,
  348 | }) => {
  349 |   await expect(page).toHaveScreenshot("home.png", {
  350 |     fullPage: true,
  351 |     animations: "disabled",
  352 |   });
  353 |   await add(page);
  354 |   await expect(page).toHaveScreenshot("detail.png", {
  355 |     fullPage: true,
  356 |     animations: "disabled",
  357 |   });
  358 |   await page.goto("/cart");
  359 |   await expect(page.getByTestId("total")).toBeVisible();
  360 |   await expect(page).toHaveScreenshot("cart.png", {
  361 |     fullPage: true,
  362 |     animations: "disabled",
  363 |   });
  364 |   await login(page);
  365 |   await page.goto("/checkout");
  366 |   await expect(page.getByTestId("total")).toBeVisible();
  367 |   await expect(page).toHaveScreenshot("checkout.png", {
  368 |     fullPage: true,
  369 |     animations: "disabled",
  370 |   });
  371 | });
  372 | 
```