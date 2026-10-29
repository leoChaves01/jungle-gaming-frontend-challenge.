# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contracts.spec.ts >> respostas fora de ordem, preço na URL e recuperação de conexão
- Location: tests\contracts.spec.ts:121:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /min=0.1/
Received string:  "http://127.0.0.1:4173/?q=Spirit&category=&network=&sort=recent&page=1&min=%220.1%22&max="
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × locator resolved to <html lang="pt-BR">…</html>
       - unexpected value "http://127.0.0.1:4173/?q=Spirit&category=&network=&sort=recent&page=1&min=%220.1%22&max="

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
  - link "Entrar":
    - /url: /login
- main:
  - paragraph: Bem-vindo à Kurio
  - heading "SEJA DONO DO FUTURO DA ARTE DIGITAL" [level=1]:
    - text: SEJA DONO DO FUTURO DA
    - emphasis: ARTE DIGITAL
  - paragraph: Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.
  - link "Explorar coleção":
    - /url: "#catalog"
  - link "Bored Jungle, destaque da coleção":
    - /url: /nft/1
    - img "Bored Jungle, destaque da coleção"
  - paragraph: ENCONTRE SUA PRÓXIMA PEÇA
  - heading "Explore o marketplace" [level=2]
  - text: Arte que conecta.
  - complementary:
    - heading "Filtros" [level=3]
    - text: Buscar NFTs
    - textbox "Buscar NFTs":
      - /placeholder: Nome ou criador
      - text: Spirit
    - button "Buscar"
    - text: Categoria
    - combobox "Categoria":
      - option "Todas as categorias" [selected]
      - option "Arte"
      - option "Colecionáveis"
      - option "Fotografia"
      - option "Gaming"
    - text: Rede
    - combobox "Rede":
      - option "Todas as redes" [selected]
      - option "Ethereum"
      - option "Polygon"
    - button "Limpar filtros"
    - text: Preço mínimo (ETH)
    - spinbutton "Preço mínimo (ETH)": "0.1"
    - text: Preço máximo (ETH)
    - spinbutton "Preço máximo (ETH)"
  - status: 3 NFTs disponíveis
  - text: Ordenar por
  - combobox "Ordenar por":
    - option "Mais recentes" [selected]
    - option "Menor preço"
    - option "Maior preço"
  - article:
    - 'link "Azuki Spirit #110, arte de Jungle Collective Fotografia Jungle Collective ✓ Azuki Spirit #110 Preço 0.1375 ETH"':
      - /url: /nft/11
      - 'img "Azuki Spirit #110, arte de Jungle Collective"'
      - text: Fotografia
      - paragraph: Jungle Collective ✓
      - 'heading "Azuki Spirit #110" [level=3]'
      - text: Preço
      - strong: 0.1375 ETH
  - article:
    - 'link "Azuki Spirit #118, arte de Jungle Collective Fotografia Jungle Collective ✓ Azuki Spirit #118 Preço 0.2375 ETH"':
      - /url: /nft/19
      - 'img "Azuki Spirit #118, arte de Jungle Collective"'
      - text: Fotografia
      - paragraph: Jungle Collective ✓
      - 'heading "Azuki Spirit #118" [level=3]'
      - text: Preço
      - strong: 0.2375 ETH
  - article:
    - 'link "Azuki Spirit #126, arte de Jungle Collective Fotografia Jungle Collective ✓ Azuki Spirit #126 Preço 0.3375 ETH"':
      - /url: /nft/27
      - 'img "Azuki Spirit #126, arte de Jungle Collective"'
      - text: Fotografia
      - paragraph: Jungle Collective ✓
      - 'heading "Azuki Spirit #126" [level=3]'
      - text: Preço
      - strong: 0.3375 ETH
  - navigation "Paginação":
    - button "Anterior" [disabled]
    - text: Página 1
    - button "Próxima" [disabled]
  - paragraph: SUA IDENTIDADE DIGITAL
  - heading "Uma coleção tão única quanto você." [level=2]
  - link "Comece sua jornada":
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
  38  |     const forbidden = await call('/orders/' + first.data.id);
  39  |     return {
  40  |       unauthorized: unauthorized.status,
  41  |       first: first.data.id,
  42  |       repeat: repeat.data.id,
  43  |       conflict: conflict.status,
  44  |       forbidden: forbidden.status,
  45  |     };
  46  |   });
  47  |   expect(results).toEqual({
  48  |     unauthorized: 401,
  49  |     first: 'GM-1',
  50  |     repeat: 'GM-1',
  51  |     conflict: 409,
  52  |     forbidden: 403,
  53  |   });
  54  | });
  55  | test('avatar persiste e carteira pode ser editada', async ({ page }) => {
  56  |   await page.goto('/login');
  57  |   await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  58  |   await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  59  |   await page.getByRole('button', { name: 'Entrar na conta' }).click();
  60  |   await expect(page).not.toHaveURL(/login/);
  61  |   await page.goto('/profile');
  62  |   const png = Buffer.from(
  63  |     'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0ioAAAAASUVORK5CYII=',
  64  |     'base64',
  65  |   );
  66  |   await page
  67  |     .getByLabel(/Alterar avatar/)
  68  |     .setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: png });
  69  |   await page.getByRole('button', { name: 'Salvar perfil' }).click();
  70  |   await expect(page.getByText('Perfil atualizado.')).toBeVisible();
  71  |   await page.reload();
  72  |   await expect(page.getByRole('img', { name: 'Seu avatar' })).toHaveAttribute(
  73  |     'src',
  74  |     /^data:image\/png/,
  75  |   );
  76  |   await page.goto('/wallets');
  77  |   await page.getByRole('button', { name: 'Editar', exact: true }).click();
  78  |   await page.getByLabel('Nome da carteira').fill('Minha principal');
  79  |   await page.getByRole('button', { name: 'Salvar carteira' }).click();
  80  |   await expect(page.getByText('Carteira salva.')).toBeVisible();
  81  |   await page.reload();
  82  |   await expect(page.getByRole('heading', { name: /Minha principal/ })).toBeVisible();
  83  | });
  84  | test('carteira: recusa, rede incompatível e desconexão', async ({ page }) => {
  85  |   await page.goto('/login');
  86  |   await page.getByLabel('E-mail', { exact: true }).fill('ana@demo.com');
  87  |   await page.getByLabel('Senha', { exact: true }).fill('Demo123!');
  88  |   await page.getByRole('button', { name: 'Entrar na conta' }).click();
  89  |   await expect(page).not.toHaveURL(/login/);
  90  |   await page.goto('/nft/1');
  91  |   await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  92  |   await expect(page.getByText('NFT adicionado.')).toBeVisible();
  93  |   await page.goto('/checkout');
  94  |   await page.getByLabel('Simular recusa de conexão').check();
  95  |   await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  96  |   await expect(page.getByText(/Conexão recusada pela carteira/)).toBeVisible();
  97  |   await page.getByLabel('Simular recusa de conexão').uncheck();
  98  |   await page.getByLabel('Rede de pagamento').selectOption('Polygon');
  99  |   await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  100 |   await expect(page.getByText(/Selecione a mesma rede/)).toBeVisible();
  101 |   await page.getByLabel('Rede de pagamento').selectOption('Ethereum');
  102 |   await page.getByRole('button', { name: 'Conectar carteira', exact: true }).click();
  103 |   await page.getByRole('button', { name: 'Desconectar carteira', exact: true }).click();
  104 |   await expect(page.getByRole('button', { name: 'Revisar pedido' })).toBeDisabled();
  105 | });
  106 | test('estoque zerado por Socket.IO impede compra', async ({ page }) => {
  107 |   await page.goto('/nft/1');
  108 |   await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  109 |   await expect(page.getByText('NFT adicionado.')).toBeVisible();
  110 |   await page.goto('/cart');
  111 |   await page.locator('.demo-panel summary').click();
  112 |   await page.getByRole('button', { name: 'Esgotar NFT 1' }).click();
  113 |   await expect(
  114 |     page.getByRole('status').filter({ hasText: 'atualizado em tempo real' }),
  115 |   ).toBeVisible();
  116 |   await expect(
  117 |     page.getByText('Quantidade indisponível. Ajuste ou remova este item.'),
  118 |   ).toBeVisible();
  119 |   await expect(page.getByLabel('Quantidade de Bored Jungle #100')).toHaveAttribute('max', '0');
  120 | });
  121 | test('respostas fora de ordem, preço na URL e recuperação de conexão', async ({ page }) => {
  122 |   await page.goto('/');
  123 |   await page.locator('.nft-card').first().waitFor();
  124 |   await page.locator('.demo-panel summary').click();
  125 |   await page.getByLabel('Cenário', { exact: true }).selectOption('race');
  126 |   await page.getByRole('button', { name: 'Aplicar cenário', exact: true }).click();
  127 |   await expect(page.getByText('Cenário atualizado.')).toBeVisible();
  128 |   await page.getByLabel('Buscar NFTs').fill('b');
  129 |   await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  130 |   await page.getByLabel('Buscar NFTs').fill('Spirit');
  131 |   await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  132 |   await expect(page.locator('.nft-card')).toHaveCount(4);
  133 |   await expect(page.locator('.nft-card').first()).toContainText('Azuki Spirit');
  134 |   await page.reload();
  135 |   await expect(page.getByLabel('Buscar NFTs')).toHaveValue('Spirit');
  136 |   await page.getByLabel('Preço mínimo (ETH)').fill('0.1');
  137 |   await expect(page.locator('.nft-card')).toHaveCount(3);
> 138 |   await expect(page).toHaveURL(/min=0.1/);
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  139 |   await page.locator('.demo-panel summary').click();
  140 |   await page.getByLabel('Cenário', { exact: true }).selectOption('offline');
  141 |   await page.getByRole('button', { name: 'Aplicar cenário', exact: true }).click();
  142 |   await expect(page.getByRole('alert')).toContainText('Sem conexão');
  143 |   await page.getByLabel('Cenário', { exact: true }).selectOption('normal');
  144 |   await page.getByRole('button', { name: 'Aplicar cenário', exact: true }).click();
  145 |   await expect(page.locator('.nft-card')).toHaveCount(3);
  146 | });
  147 | 
```