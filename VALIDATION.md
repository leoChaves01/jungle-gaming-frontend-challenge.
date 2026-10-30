# Validação da entrega

Relatório gerado a partir dos resultados executados, em 2026-10-30T10:35:09.252Z.

## Build e qualidade

- `npm run typecheck`, `npm run lint` e `npm run build`: executados com sucesso.
- Instalação em cópia limpa com `npm ci` e build: executados com sucesso. Logs em [clean-install.log](reports/clean-install.log) e [clean-build.log](reports/clean-build.log).
- O chunk inicial foi reduzido de 505,45 para 458,31 kB antes de gzip pela separação de conta, compra e drawer mobile em módulos carregados sob demanda. O aviso de chunk acima de 500 kB deixou de ocorrer sem alterar o limite.
- Dependências de produção: zero vulnerabilidades no relatório npm salvo. A árvore completa possui 10 alertas high transitivos nas ferramentas de desenvolvimento/auditoria. Não foi aplicado `npm audit fix --force`, que sugere mudanças incompatíveis. Veja [relatório completo](npm-audit.json) e [produção](reports-dependencies.json).

## Playwright

Última execução completa local: **48 aprovados, 0 falhas, 0 flaky, 0 ignorados**, em 189.0 s. Dois projetos Chromium: desktop 1440 × 1000 e mobile 390 × 844. A verificação de overflow percorre dez rotas em 390, 768 e 1440 px.

- [Relatório HTML](playwright-report/index.html) e [JSON](reports/e2e.json).
- Oito baselines versionadas: início, detalhe, carrinho e pagamento × dois viewports, em `tests/marketplace.spec.ts-snapshots/`.
- Cada teste usa um BrowserContext isolado. O cenário pendente controla Date com o relógio Playwright; latência e eventos são selecionados no mock. Não há alteração direta do cache/UI para fingir eventos.
- Testes cobrem compra/recusa/timeout, idempotência e conflito, snapshot do recibo, isolamento entre contas, sessão expirada, favoritos com rollback, perfil/avatar/senha/carteiras, filtros/URL, respostas fora de ordem, Socket.IO, reconexão, teclado e erros.
- A captura mobile também foi ajustada para não esperar imagens lazy dentro de filtros fechados; trace em reports/reference-test-development. Falhas intermediárias foram corrigidas ou tiveram a alteração causadora revertida. Seus traces e screenshots estão preservados nas pastas `reports/previous-failures`, `url-assertion-failures`, `clock-test-failures` e `startup-failure`. Abra um trace com `npx playwright show-trace caminho/trace.zip`.
- A falha remota de estoque durante uma consulta inicial está preservada em [ci-inflight-race.zip](reports/ci-inflight-race.zip). O cliente agora cancela a resposta em andamento antes de reconciliar com REST; o cenário passou em dez repetições adicionais. Uma execução local interrompida por cerca de duas horas está separada em `reports/interrupted-run` e não é o resultado final acima.

## Testes da URL pública

Executados em https://jungle-gaming-frontend-challenge-iota.vercel.app: **48 aprovados, 0 falhas, 0 flaky**. Relatórios em [HTML público](reports/public-playwright/index.html) e [JSON público](reports/public-e2e.json).

## GitHub Actions

[Execução remota](https://github.com/leoChaves01/jungle-gaming-frontend-challenge./actions/runs/41037921452): **aprovada**, commit 8774328d6045cc364a0499cffff0691e7adda398. O workflow instala dependências e Chromium, executa tipos, lint, build e os 48 testes, incluindo as baselines. Evidência: [ci-summary.json](reports/ci-summary.json).

O repositório termina em ponto, nome incompatível com o diretório padrão do runner Windows. O workflow busca o SHA exato em uma pasta temporária válida. As falhas iniciais de checkout e configuração foram corrigidas, sem renomear o repositório.

## Lighthouse

Três medições por página/perfil, total de 12, no build de produção com cenário normal, imagens/fontes locais e funcionalidades completas. Cada execução inicia um navegador limpo. Throttling simulado padrão de cada perfil. O preview negocia compressão HTTP para todos os acessos, mantendo os assets completos. O script verifica se o formFactor realmente corresponde ao perfil solicitado.

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início | mobile | 82 | 100 | 96 | 100 | 3.65 s | 0.000 | 183 ms |
| Início | desktop | 99 | 100 | 100 | 100 | 0.83 s | 0.000 | 0 ms |
| Detalhe | mobile | 84 | 100 | 100 | 100 | 3.45 s | 0.000 | 187 ms |
| Detalhe | desktop | 99 | 100 | 100 | 100 | 0.78 s | 0.039 | 0 ms |

Valores são medianas. Metas: 90 / 95 / 95 / 90. Há metas pendentes: home/mobile, detail/mobile. O custo de inicialização, avaliação e download do MSW e do bundle React limita especialmente LCP/TBT no perfil mobile. Preload do mock, fonte e imagem, CSS com escopo de análise explícito e skeleton dimensionado já foram aplicados; os mocks não foram removidos para elevar notas.

Ambiente: Windows_NT 10.0.26200; 13th Gen Intel(R) Core(TM) i7-1355U; Node v22.14.0; Lighthouse 12.6.1; Chromium 156.0.8078.4 (Playwright Chromium headless shell). O Chrome completo falhou ao iniciar neste Windows; o Headless Shell foi utilizado e é reproduzível pelo script.

[Medianas e execuções](reports/lighthouse/summary.json). HTML e JSON individuais ficam em `reports/lighthouse/`. As pastas `lighthouse-initial` e `lighthouse-before-network-preload` são diagnósticos anteriores, não resultados finais. Na primeira rodada, arquivos rotulados desktop ainda usaram emulação mobile; isso foi corrigido e verificado antes das medições finais.

## Publicação, limitações e metas pendentes

1. **Publicação:** [Aplicação na Vercel](https://jungle-gaming-frontend-challenge-iota.vercel.app) vinculada ao [repositório autorizado](https://github.com/leoChaves01/jungle-gaming-frontend-challenge.). A autenticação foi concluída. Resultados da execução HTTPS são registrados separadamente nos arquivos reports/public-e2e.json e reports/public-playwright/.

2. **Figma:** direção visual reproduzida, mas não houve inspeção/exportação integral dos assets e de todos os frames. O acesso disponível exige autenticação para inspecionar. Os retratos WebP foram reconstruídos com ImageGen a partir das capturas do usuário (ASSETS.md) e a fonte é Roboto Mono. A fidelidade integral permanece pendente. As baselines validam esta implementação, não equivalência ao Figma.
3. **Performance mobile:** as medianas ficaram abaixo de 90, conforme a tabela e os relatórios completos. Conta, compra e menu já foram separados em módulos sob demanda. Ainda é necessário reduzir o custo de inicialização do bundle compartilhado e do MSW sem perder a interceptação de rede antes das consultas. A tentativa anterior de montar a interface antes do MSW gerou uma falha intermitente e foi revertida.
4. Os alertas transitivos de desenvolvimento acima permanecem registrados. A simulação é local ao navegador e não pretende ser backend, autenticação ou pagamento de produção.

Os comandos e relatórios acima permitem reproduzir a validação. A versão pública tem uma rodada própria de testes com TEST_BASE_URL; a validação local não substitui essa evidência.
