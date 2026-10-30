# Kurio — Jungle Gaming Frontend Challenge

Implementação React + TypeScript do marketplace de NFTs. **Todas as compras, identidades, carteiras e transações são fictícias.** O enunciado original completo está em [CHALLENGE.md](CHALLENGE.md).

Aplicação publicada: [Kurio na Vercel](https://jungle-gaming-frontend-challenge-iota.vercel.app).

## Executar

Requisitos: Node.js 22.14 ou superior e npm 10. Um navegador Chromium é instalado separadamente para os testes.

```sh
npm ci
npx playwright install chromium
npm run dev
```

Abra o endereço apresentado pelo Vite (normalmente http://127.0.0.1:5173).

```sh
npm run typecheck
npm run lint
npm run build
npm run preview
npm test
npm run test:update
npm run audit
```

`npm run audit` requer o preview de produção rodando em http://127.0.0.1:4173. Gera 12 medições: início/detalhe × mobile/desktop × 3 execuções. A configuração está em `scripts/lighthouse.mjs`. Não confundir com `npm audit`, a auditoria de dependências do npm.

O Playwright inicia o preview automaticamente quando não está rodando. Os testes são isolados por BrowserContext, usando os mesmos handlers e fixtures da aplicação. Os snapshots são específicos de Chromium/Windows; em outro SO, revise diferenças de rasterização antes de atualizar as imagens.

## Configuração

Copie `.env.example` para `.env.local` se necessário. `VITE_MOCKS=true` ativa a simulação; a ausência da variável também a ativa, inclusive no build publicado. `false` desativa os mocks, mas **não há backend de produção fornecido**. Não use essa opção na demonstração. Não é necessário token, carteira real ou serviço privado.

## Credenciais fictícias

| Conta       | E-mail         | Senha    |
| ----------- | -------------- | -------- |
| Ana Silva   | ana@demo.com   | Demo123! |
| Bruno Costa | bruno@demo.com | Demo123! |

As duas contas iniciam com uma carteira Ethereum. Um novo cadastro começa sem carteira; crie uma em `/wallets`. O endereço precisa ter `0x` e 40 dígitos hexadecimais. Exemplo: `0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`.

## Cenários e reset

Abra **Laboratório de demonstração** no rodapé de qualquer tela. Selecione o cenário e clique **Aplicar cenário**. O cenário permanece após refresh até ser alterado ou resetado.

| Cenário          | Como observar                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| normal           | Fluxo padrão; pedido confirma após cerca de 2,5 s                                                                   |
| slow             | 2,2 s por REST; abrir detalhe/carrinho para ver shimmer                                                             |
| race             | Busca com 1 caractere demora 900 ms; outras 80 ms                                                                   |
| offline          | MSW retorna falha de rede; retorne a normal pelo laboratório                                                        |
| invalid-response | Retorna HTML em vez de JSON para o carrinho; a página permanece utilizável e permite recuperação                    |
| server-error     | REST retorna 503; retorne a normal e tente novamente                                                                |
| expired          | Expira a sessão atual; checkout retorna ao login preservando o destino                                              |
| favorite-error   | Favorito falha com 503; atualização otimista é revertida                                                            |
| declined         | Próximo pedido termina recusado; carrinho preservado                                                                |
| timeout          | Cria pedido, mas resposta demora 12 s; Axios encerra aos 5 s. Use Recuperar mesma tentativa, inclusive após refresh |
| pending          | Pedido leva 20 s; interrompa conexão ou atualize a página                                                           |

Busca por `inexistente` exercita vazio. `/nft/404` exercita recurso inexistente. Cadastro com `ana@demo.com` exercita conflito. `JUNGLE10` concede 10% de desconto; `EXPIRED` retorna cupom expirado e outros códigos retornam inválido.

**Alterar preço NFT 1**, **Esgotar NFT 1** e **Duplicar evento** alteram o banco simulado e emitem frames Socket.IO via MSW. Adicione o NFT 1 ao carrinho, revise o checkout, altere o preço e confirme: a cotação antiga deve ser recusada e exigir outra confirmação. **Interromper conexão** fecha o transporte; o cliente reconecta e consulta REST novamente.

**Resetar demonstração** recria integralmente catálogo, contas, carteiras, carrinhos, favoritos, pedidos e cenário; volta ao início. Use apenas dados fictícios: o banco simulado persiste em localStorage e é inspecionável no navegador.

## Entrega e evidências

- Arquitetura, REST, eventos, decisões e limitações: [ARCHITECTURE.md](ARCHITECTURE.md).
- Resultado das verificações: [VALIDATION.md](VALIDATION.md).
- Relatório E2E: `playwright-report/index.html`; traces de falhas em `test-results/`.
- Baselines visuais: `tests/marketplace.spec.ts-snapshots/`.
- Lighthouse: `reports/lighthouse/`, com HTML, JSON e medianas em `summary.json`.

## Deploy na Vercel

Importe este diretório como repositório/projeto Vite. Build: `npm run build`; output: `dist`; variável: `VITE_MOCKS=true`. `vercel.json` contém os rewrites SPA e impede cache persistente do service worker. O deploy deve ser HTTPS para permitir o service worker.

Alternativa com CLI autenticada:

```sh
npx vercel --prod
```

Após publicar, teste acesso direto e refresh em `/nft/1`, `/cart` e `/checkout`, além do cenário Socket.IO. Repositório de entrega autorizado: [leoChaves01/jungle-gaming-frontend-challenge.](https://github.com/leoChaves01/jungle-gaming-frontend-challenge.). O código já foi enviado. A autenticação foi concluída e o projeto foi publicado em https://jungle-gaming-frontend-challenge-iota.vercel.app. O último resultado de validação da versão pública está no relatório abaixo. Veja [VALIDATION.md](VALIDATION.md).

## Referência visual

O arquivo Figma identifica a página como GreenMint, mas o frame inicial exibe a marca **KURIO**, fundo marrom, botões ocre e tipografia monoespaçada. A implementação usa essa direção. Os quatro personagens foram reconstruídos com ImageGen a partir das capturas fornecidas e otimizados como WebP. Não são exports originais do Figma. Prompts, arquivos originais e substituições estão em [ASSETS.md](ASSETS.md). A fidelidade integral ao Figma permanece pendente; as baselines verificam regressões desta implementação, não equivalência automática ao Figma.

Para verificar a versão publicada, defina `TEST_BASE_URL` com a URL HTTPS e execute `npm test`. Os relatórios públicos serão gravados separadamente em `reports/public-playwright/` e `reports/public-e2e.json`. Não execute duas instâncias do Playwright simultaneamente usando a mesma pasta de resultados.

O CI usa Windows para manter as mesmas baselines. Como o nome do repositório termina em ponto, o workflow faz checkout do SHA exato em uma pasta temporária de nome válido; o diretório padrão do GitHub Actions falha nesse caso.

## Atualização das referências visuais

Os prints enviados em 29/10 orientam o cabeçalho, grade de nove itens, personagens, preços iniciais, banners, Diário da Cunhagem, rodapé e login em diálogo. Avatares de comentários e seleções azuis do Figma não fazem parte da interface. Newsletter, redes sociais, recuperação por e-mail e OAuth exibem avisos de indisponibilidade, sem simular envio ou autenticação bem-sucedida. O catálogo possui 36 NFTs; contagens dos filtros vêm da API e representam a simulação, não números decorativos do frame.

As novas fixtures usam `greenmint.mock.v3`; dados da demonstração anterior em v2 não são apagados, mas não são carregados nesta versão. Use apenas dados fictícios.

No PowerShell, a validação pública pode ser reproduzida assim:

```powershell
$env:TEST_BASE_URL = 'https://jungle-gaming-frontend-challenge-iota.vercel.app'
npm test
Remove-Item Env:TEST_BASE_URL
```
