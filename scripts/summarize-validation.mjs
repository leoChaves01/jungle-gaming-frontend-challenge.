import fs from 'node:fs/promises';

const e2e = JSON.parse(await fs.readFile('reports/e2e.json', 'utf8'));
const audit = JSON.parse(await fs.readFile('reports/lighthouse/summary.json', 'utf8'));
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
- O Vite informa um chunk principal de aproximadamente 505 kB antes de gzip. O aviso permanece registrado; não foi ocultado aumentando o limite.
- Dependências de produção: zero vulnerabilidades no relatório npm salvo. A árvore completa possui 10 alertas high transitivos nas ferramentas de desenvolvimento/auditoria. Não foi aplicado \`npm audit fix --force\`, que sugere mudanças incompatíveis. Veja [relatório completo](npm-audit.json) e [produção](reports-dependencies.json).

## Playwright

Última execução: **${e2e.stats.expected} aprovados, ${e2e.stats.unexpected} falhas, ${e2e.stats.flaky} flaky, ${e2e.stats.skipped} ignorados**, em ${(e2e.stats.duration / 1000).toFixed(1)} s. Dois projetos Chromium: desktop 1440 × 1000 e mobile 390 × 844. A verificação de overflow percorre dez rotas em 390, 768 e 1440 px.

- [Relatório HTML](playwright-report/index.html) e [JSON](reports/e2e.json).
- Oito baselines versionadas: início, detalhe, carrinho e pagamento × dois viewports, em \`tests/marketplace.spec.ts-snapshots/\`.
- Cada teste usa um BrowserContext isolado. O cenário pendente controla Date com o relógio Playwright; latência e eventos são selecionados no mock. Não há alteração direta do cache/UI para fingir eventos.
- Testes cobrem compra/recusa/timeout, idempotência e conflito, snapshot do recibo, isolamento entre contas, sessão expirada, favoritos com rollback, perfil/avatar/senha/carteiras, filtros/URL, respostas fora de ordem, Socket.IO, reconexão, teclado e erros.
- Falhas intermediárias foram corrigidas ou tiveram a alteração causadora revertida. Seus traces e screenshots estão preservados nas pastas \`reports/previous-failures\`, \`url-assertion-failures\`, \`clock-test-failures\` e \`startup-failure\`. Abra um trace com \`npx playwright show-trace caminho/trace.zip\`.

## Lighthouse

Três medições por página/perfil, total de 12, no build de produção com cenário normal, imagens/fontes locais e funcionalidades completas. Cada execução inicia um navegador limpo. Throttling simulado padrão de cada perfil. O script verifica se o formFactor realmente corresponde ao perfil solicitado.

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

Valores são medianas. Metas: 90 / 95 / 95 / 90. ${below.length ? 'Há metas pendentes: ' + below.map((r) => r.page + '/' + r.profile).join(', ') + '. O custo de inicialização, avaliação e download do MSW e do bundle React limita especialmente LCP/TBT no perfil mobile. Preload do mock, fonte e imagem, CSS com escopo de análise explícito e skeleton dimensionado já foram aplicados; os mocks não foram removidos para elevar notas.' : 'As quatro combinações atingiram as metas de todas as categorias.'}

Ambiente: ${audit.environment.os}; ${audit.environment.cpu}; Node ${audit.environment.node}; Lighthouse ${audit.lighthouseVersion}; Chromium ${audit.environment.chromeVersion} (${audit.environment.chrome}). O Chrome completo falhou ao iniciar neste Windows; o Headless Shell foi utilizado e é reproduzível pelo script.

[Medianas e execuções](reports/lighthouse/summary.json). HTML e JSON individuais ficam em \`reports/lighthouse/\`. As pastas \`lighthouse-initial\` e \`lighthouse-before-network-preload\` são diagnósticos anteriores, não resultados finais. Na primeira rodada, arquivos rotulados desktop ainda usaram emulação mobile; isso foi corrigido e verificado antes das medições finais.

## Pendências que impedem chamar a entrega de integral

1. **Publicação:** configuração Vercel pronta, mas publicação ainda em andamento no repositório confirmado leoChaves01/jungle-gaming-frontend-challenge.. O deploy é obrigatório no enunciado e ainda precisa ser feito e validado em HTTPS.
2. **Figma:** direção visual reproduzida, mas não houve inspeção/exportação integral dos assets e de todos os frames. O acesso disponível exige autenticação para inspecionar. Os retratos WebP foram reconstruídos com ImageGen a partir das capturas do usuário (ASSETS.md) e a fonte é Roboto Mono. A fidelidade integral permanece pendente. As baselines validam esta implementação, não equivalência ao Figma.
3. Os alertas transitivos de desenvolvimento acima permanecem registrados. A simulação é local ao navegador e não pretende ser backend, autenticação ou pagamento de produção.

Os testes e auditorias dão evidência dos comportamentos verificados; não garantem aprovação na entrevista nem substituem a revisão visual e o teste do deploy.
`;
await fs.writeFile('VALIDATION.md', text);
