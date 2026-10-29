# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> 12 teclado e foco de diálogo
- Location: tests\marketplace.spec.ts:292:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator:  getByRole('button', { name: 'Adicionar carteira' })
Expected: focused
Received: inactive
Timeout:  10000ms

Call log:
  - Expect "toBeFocused" getByRole('button', { name: 'Adicionar carteira' }) with timeout 10000ms
  - waiting for getByRole('button', { name: 'Adicionar carteira' })
    23 × locator resolved to <button class="inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50 disabled:pointer-events-none bg-violet-600 text-white hover:bg-violet-700 px-6 py-3">Adicionar carteira</button>
       - unexpected value "inactive"

```

```yaml
- button "Adicionar carteira"
```

# Test source

```ts
  204 |   await expect(page.getByLabel("Quantidade de Bored Jungle #100")).toHaveValue(
  205 |     "1",
  206 |   );
  207 | });
  208 | test("08 timeout e reenvio recuperam o mesmo pedido", async ({ page }) => {
  209 |   await checkout(page);
  210 |   await demo(page, "timeout");
  211 |   await page.getByRole("button", { name: "Confirmar compra simulada" }).click();
  212 |   await expect(page.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  213 |   await expect(page.getByRole("alert")).toContainText("demorou");
  214 |   await page.reload();
  215 |   await page.getByRole("button", { name: "Recuperar mesma tentativa" }).click();
  216 |   await expect(page).toHaveURL(/order\/GM-1/);
  217 |   await expect(
  218 |     page.getByRole("heading", { name: "Pedido confirmado!" }),
  219 |   ).toBeVisible();
  220 | });
  221 | test("09 perfil, senha, validação e carteira", async ({ page }) => {
  222 |   await login(page);
  223 |   await page.goto("/profile");
  224 |   await page.getByLabel("Nome completo").fill("Ana Colecionadora");
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
> 304 |   await expect(trigger).toBeFocused();
      |                         ^ Error: expect(locator).toBeFocused() failed
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
  325 |   await expect(page).toHaveURL(/login/);
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