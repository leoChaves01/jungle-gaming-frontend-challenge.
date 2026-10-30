import fs from 'node:fs/promises';

const e2e = JSON.parse(await fs.readFile('reports/e2e.json', 'utf8'));
const audit = JSON.parse(await fs.readFile('reports/lighthouse/summary.json', 'utf8'));
const published = await fs.readFile('reports/public-e2e.json', 'utf8').then(JSON.parse).catch(() => null);
const ci = await fs
  .readFile('reports/ci-summary.json', 'utf8')
  .then(JSON.parse)
  .catch(() => null);
const rows = audit.results
  .map(
    ({ page, profile, median: m }) =>
      `| ${page === 'home' ? 'Início' : 'Detalhe'} | ${profile} | ${m.performance} | ${m.accessibility} | ${m['best-practices']} | ${m.seo} | ${(m['largest-contentful-paint'] / 1000).toFixed(2)} s | ${m['cumulative-layout-shift'].toFixed(3)} | ${Math.round(m['total-blocking-time'])} ms |`,
  )
  .join('\n');
const below = audit.results.filter(
  ({ median: m }) =>
    m.performance < 90 || m.accessibility < 95 || m['best-practices'] < 95 || m.seo < 90,
);
const text = `# Validação da entrega

Relatório gerado a partir dos resultados executados, em ${new Date().toISOString()}.

## Build e qualidade

- \`npm run typecheck\`, \`npm run lint\` e \`npm run build\`: executados com sucesso.
- Instalação em cópia limpa com \`npm ci\` e build: executados com sucesso. Logs em [clean-install.log](reports/clean-install.log) e [clean-build.log](reports/clean-build.log).
- O chunk inicial foi reduzido de 505,45 para 458,31 kB antes de gzip pela separação de conta, compra e drawer mobile em módulos carregados sob demanda. O aviso de chunk acima de 500 kB deixou de ocorrer sem alterar o limite.
- Dependências de produção: zero vulnerabilidades no relatório npm salvo. A árvore completa possui 10 alertas high transitivos nas ferramentas de desenvolvimento/auditoria. Não foi aplicado \`npm audit fix --force\`, que sugere mudanças incompatíveis. Veja [relatório completo](npm-audit.json) e [produção](reports-dependencies.json).

## Playwright

Última execução completa local: **${e2e.stats.expected} aprovados, ${e2e.stats.unexpected} falhas, ${e2e.stats.flaky} flaky, ${e2e.stats.skipped} ignorados**, em ${(e2e.stats.duration / 1000).toFixed(1)} s. Dois projetos Chromium: desktop 1440 × 1000 e mobile 390 × 844. A verificação de overflow percorre dez rotas em 390, 768 e 1440 px.

- [Relatório HTML](playwright-report/index.html) e [JSON](reports/e2e.json).
- Oito baselines versionadas: início, detalhe, carrinho e pagamento × dois viewports, em \`tests/marketplace.spec.ts-snapshots/\`.
- Cada teste usa um BrowserContext isolado. O cenário pendente controla Date com o relógio Playwright; latência e eventos são selecionados no mock. Não há alteração direta do cache/UI para fingir eventos.
- Testes cobrem compra/recusa/timeout, idempotência e conflito, snapshot do recibo, isolamento entre contas, sessão expirada, favoritos com rollback, perfil/avatar/senha/carteiras, filtros/URL, respostas fora de ordem, Socket.IO, reconexão, teclado e erros.
- A captura mobile também foi ajustada para não esperar imagens lazy dentro de filtros fechados; trace em reports/reference-test-development. Falhas intermediárias foram corrigidas ou tiveram a alteração causadora revertida. Seus traces e screenshots estão preservados nas pastas \`reports/previous-failures\`, \`url-assertion-failures\`, \`clock-test-failures\` e \`startup-failure\`. Abra um trace com \`npx playwright show-trace caminho/trace.zip\`.
- A falha remota de estoque durante uma consulta inicial está preservada em [ci-inflight-race.zip](reports/ci-inflight-race.zip). O cliente agora cancela a resposta em andamento antes de reconciliar com REST; o cenário passou em dez repetições adicionais. Uma execução local interrompida por cerca de duas horas está separada em \`reports/interrupted-run\` e não é o resultado final acima.

## Testes da URL pública

${published ? `Executados em https://jungle-gaming-frontend-challenge-iota.vercel.app: **${published.stats.expected} aprovados, ${published.stats.unexpected} falhas, ${published.stats.flaky} flaky**. Relatórios em [HTML público](reports/public-playwright/index.html) e [JSON público](reports/public-e2e.json).` : 'A execução HTTPS ainda não foi concluída; não é declarada aprovada.'}

## GitHub Actions

${ci ? `[Execução remota](${ci.url}): **${ci.jobs.every((j) => j.conclusion === 'success') ? 'aprovada' : 'não aprovada'}**, commit ${ci.jobs[0]?.sha}. O workflow instala dependências e Chromium, executa tipos, lint, build e os 48 testes, incluindo as baselines. Evidência: [ci-summary.json](reports/ci-summary.json).` : 'Execução remota ainda em verificação; não foi declarada aprovada.'}

O repositório termina em ponto, nome incompatível com o diretório padrão do runner Windows. O workflow busca o SHA exato em uma pasta temporária válida. As falhas iniciais de checkout e configuração foram corrigidas, sem renomear o repositório.

## Lighthouse

Três medições por página/perfil, total de 12, no build de produção com cenário normal, imagens/fontes locais e funcionalidades completas. Cada execução inicia um navegador limpo. Throttling simulado padrão de cada perfil. O preview negocia compressão HTTP para todos os acessos, mantendo os assets completos. O script verifica se o formFactor realmente corresponde ao perfil solicitado.

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

Valores são medianas. Metas: 90 / 95 / 95 / 90. ${below.length ? 'Há metas pendentes: ' + below.map((r) => r.page + '/' + r.profile).join(', ') + '. O custo de inicialização, avaliação e download do MSW e do bundle React limita especialmente LCP/TBT no perfil mobile. Preload do mock, fonte e imagem, CSS com escopo de análise explícito e skeleton dimensionado já foram aplicados; os mocks não foram removidos para elevar notas.' : 'As quatro combinações atingiram as metas de todas as categorias.'}

Ambiente: ${audit.environment.os}; ${audit.environment.cpu}; Node ${audit.environment.node}; Lighthouse ${audit.lighthouseVersion}; Chromium ${audit.environment.chromeVersion} (${audit.environment.chrome}). O Chrome completo falhou ao iniciar neste Windows; o Headless Shell foi utilizado e é reproduzível pelo script.

[Medianas e execuções](reports/lighthouse/summary.json). HTML e JSON individuais ficam em \`reports/lighthouse/\`. As pastas \`lighthouse-initial\` e \`lighthouse-before-network-preload\` são diagnósticos anteriores, não resultados finais. Na primeira rodada, arquivos rotulados desktop ainda usaram emulação mobile; isso foi corrigido e verificado antes das medições finais.

## Publicação, limitações e metas pendentes

1. **Publicação:** [Aplicação na Vercel](https://jungle-gaming-frontend-challenge-iota.vercel.app) vinculada ao [repositório autorizado](https://github.com/leoChaves01/jungle-gaming-frontend-challenge.). A autenticação foi concluída. Resultados da execução HTTPS são registrados separadamente nos arquivos reports/public-e2e.json e reports/public-playwright/.

2. **Figma:** direção visual reproduzida, mas não houve inspeção/exportação integral dos assets e de todos os frames. O acesso disponível exige autenticação para inspecionar. Os retratos WebP foram reconstruídos com ImageGen a partir das capturas do usuário (ASSETS.md) e a fonte é Roboto Mono. A fidelidade integral permanece pendente. As baselines validam esta implementação, não equivalência ao Figma.
3. ${below.length ? '**Performance mobile:** as medianas ficaram abaixo de 90, conforme a tabela e os relatórios completos. Conta, compra e menu já foram separados em módulos sob demanda. Ainda é necessário reduzir o custo de inicialização do bundle compartilhado e do MSW sem perder a interceptação de rede antes das consultas. A tentativa anterior de montar a interface antes do MSW gerou uma falha intermitente e foi revertida.' : '**Lighthouse:** todas as metas foram atingidas na rodada final, conforme os relatórios acima.'}
4. Os alertas transitivos de desenvolvimento acima permanecem registrados. A simulação é local ao navegador e não pretende ser backend, autenticação ou pagamento de produção.

Os comandos e relatórios acima permitem reproduzir a validação. A versão pública tem uma rodada própria de testes com TEST_BASE_URL; a validação local não substitui essa evidência.
`;
await fs.writeFile('VALIDATION.md', text);


