# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> 10 Socket.IO: preço novo exige confirmação nova e eventos antigos não regridem
- Location: tests\marketplace.spec.ts:195:1

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/login/
Received string: "http://127.0.0.1:4173/login?returnTo=%2F"
Timeout: 10000ms

Call log:
  - Expect "not toHaveURL" with timeout 10000ms
    23 × locator resolved to <html lang="pt-BR">…</html>
       - unexpected value "http://127.0.0.1:4173/login?returnTo=%2F"

```

```yaml
- link "Pular para conteúdo":
  - /url: "#main"
- text: Uma nova forma de colecionar.
- banner:
  - link "Kurio":
    - /url: /
  - link "Carrinho (0)":
    - /url: /cart
    - text: "0"
  - link "Entrar":
    - /url: /login
  - button "Abrir menu"
- main:
  - paragraph: BEM-VINDO AO KURIO
  - heading "Sua coleção. Sua identidade. Seu universo." [level=1]:
    - text: Sua coleção.Sua identidade.
    - emphasis: Seu universo.
  - paragraph: Conecte-se à próxima geração de colecionadores.
  - heading "Bom ter você de volta" [level=2]
  - paragraph: Entre para continuar sua jornada.
  - text: E-mail
  - textbox "E-mail": ana@demo.com
  - text: Senha
  - textbox "Senha": Demo123!
  - paragraph: "Use pelo menos 8 caracteres. Demo: ana@demo.com / Demo123!"
  - alert: Sem conexão. Tente novamente.
  - button "Entrar na conta"
  - paragraph:
    - text: Ainda não tem uma conta?
    - link "Cadastre-se":
      - /url: /register
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
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | async function demo(page: Page, scenario: string) {
  3   |   const details = page.locator('.demo-panel');
  4   |   if ((await details.getAttribute('open')) === null) await details.locator('summary').click();
  5   |   await page.getByLabel('Cenário', { exact: true }).selectOption(scenario);
  6   |   await page.getByRole('button', { name: 'Aplicar cenário', exact: true }).click();
  7   |   await expect(page.getByText('Cenário atualizado.')).toBeVisible();
  8   | }
  9   | async function login(page: Page, email = 'ana@demo.com', password = 'Demo123!') {
  10  |   await page.goto('/login');
  11  |   await page.getByLabel('E-mail', { exact: true }).fill(email);
  12  |   await page.getByLabel('Senha', { exact: true }).fill(password);
  13  |   await page.getByRole('button', { name: 'Entrar na conta' }).click();
> 14  |   await expect(page).not.toHaveURL(/\/login/);
      |                          ^ Error: expect(page).not.toHaveURL(expected) failed
  15  |   await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  16  | }
  17  | async function add(page: Page, id = '1') {
  18  |   await page.goto('/nft/' + id);
  19  |   await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  20  |   await expect(page.getByText('NFT adicionado.')).toBeVisible();
  21  | }
  22  | async function checkout(page: Page) {
  23  |   await login(page);
  24  |   await add(page);
  25  |   await page.goto('/checkout');
  26  |   await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  27  |   await page.getByRole('button', { name: 'Revisar pedido' }).click();
  28  |   await expect(page.getByRole('heading', { name: 'Revise seu pedido' })).toBeVisible();
  29  | }
  30  | test.beforeEach(async ({ page }) => {
  31  |   await page.goto('/');
  32  |   await expect(page.getByRole('heading', { name: 'Explore o marketplace' })).toBeVisible();
  33  |   await page.locator('.nft-card').first().waitFor();
  34  | });
  35  | test('01 catálogo: busca, filtros combinados, ordenação, paginação e histórico', async ({
  36  |   page,
  37  | }) => {
  38  |   await expect(page.locator('.nft-card')).toHaveCount(8);
  39  |   await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  40  |   await expect(page).toHaveURL(/page=2/);
  41  |   await page.getByLabel('Categoria', { exact: true }).selectOption('Arte');
  42  |   await expect(page).not.toHaveURL(/page=2/);
  43  |   await page.getByLabel('Rede', { exact: true }).selectOption('Ethereum');
  44  |   await page.getByLabel('Ordenar por').selectOption('high');
  45  |   await expect(page.locator('.nft-card')).toHaveCount(5);
  46  |   await page.reload();
  47  |   await expect(page.getByLabel('Categoria', { exact: true })).toHaveValue('Arte');
  48  |   await page.getByLabel('Buscar NFTs').fill('inexistente');
  49  |   await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  50  |   await expect(page.getByText('Nenhum NFT encontrado')).toBeVisible();
  51  |   await page.goBack();
  52  |   await expect(page.locator('.nft-card')).toHaveCount(5);
  53  | });
  54  | test('02 detalhe direto, edição indisponível, limite e 404', async ({ page }) => {
  55  |   await page.goto('/nft/1');
  56  |   await expect(page.getByRole('heading', { name: 'Bored Jungle #100' })).toBeVisible();
  57  |   await page.getByLabel('Edição', { exact: true }).selectOption('rare');
  58  |   await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
  59  |   await page.getByLabel('Edição', { exact: true }).selectOption('standard');
  60  |   await page.getByLabel('Quantidade', { exact: true }).fill('99');
  61  |   await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
  62  |   await page.goto('/nft/404');
  63  |   await expect(page.getByRole('alert')).toContainText('NFT não encontrado');
  64  |   await page.goto('/nada');
  65  |   await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
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
```