# Arquitetura e contratos

## Camadas

`src/contracts.ts` define entidades de transporte e conversão decimal. `src/api.ts` é o cliente Axios e configura o QueryClient. `src/router.tsx` declara rotas, search params e guardas. `src/screens.tsx` contém layout, catálogo, detalhe e componentes compartilhados. `src/account.tsx` e `src/purchase.tsx` contêm conta e compra, carregados sob demanda por lazyRouteComponent do TanStack Router. `src/components/ui/button.tsx` adapta o padrão shadcn/ui (Slot, CVA e Tailwind Merge); diálogos usam Radix com foco contido e restauração ao acionador. `src/realtime.ts` cuida do ciclo Socket.IO, versões e reconciliação. `src/mocks/` é o único lugar com fixtures e regras simuladas de negócio.

Não há respostas fictícias em componentes ou no Axios. Interações REST atravessam a rede interceptada por MSW. A persistência do mock é localStorage; sessão, contas e alterações sobrevivem ao refresh. Isso é uma simulação de servidor em um único navegador, não autenticação ou armazenamento seguros para produção.

## Rotas

| Rota                                              | Acesso                                                      |
| ------------------------------------------------- | ----------------------------------------------------------- |
| `/`                                               | Público; q, category, network, min, max, sort e page na URL |
| `/nft/$id`                                        | Público; tratamento de 404 e edição esgotada                |
| `/cart`                                           | Público, carrinho de visitante ou de usuário                |
| `/login`, `/register`                             | Público                                                     |
| `/checkout`, `/profile`, `/wallets`, `/favorites` | Sessão obrigatória                                          |
| `/order/$id`                                      | Sessão obrigatória; API verifica propriedade                |

Login aceita `returnTo` interno. Search params são normalizados pelo Router; filtros reiniciam a página. Query keys incluem todos os parâmetros e Axios recebe AbortSignal nas consultas de catálogo/detalhe para cancelar respostas antigas.

## Contrato REST

Base `/api`, JSON UTF-8. Valores ETH são **strings decimais**; quantidades são inteiros. Erro padrão: `{ "message": "mensagem legível" }`. Status: 401 sessão inválida, 403 recurso de outra conta, 404 inexistente, 409 conflito, 422 validação, 503 transitório. Campos de formulário usam validação nativa acessível e erros da API são apresentados em região de alerta.

| Método e recurso     | Entrada                                                           | Saída                                     |
| -------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| POST `/register`     | name, email, password                                             | User; 409 e-mail existente                |
| POST `/login`        | email, password                                                   | User; 401 inválido                        |
| GET `/session`       | —                                                                 | User ou null                              |
| POST `/logout`       | {}                                                                | ok                                        |
| GET `/nfts`          | q, category, network, min, max, sort=recent/new/popular/low/high, page        | items: NFT[], total, categories, networks; 9 por página         |
| GET `/nfts/:id`      | —                                                                 | NFT, com edições, estoque, preço e versão |
| GET `/favorites`     | —                                                                 | string[] de IDs do usuário                |
| POST `/favorites`    | id, active:boolean                                                | favoritos atualizados                     |
| GET `/cart`          | —                                                                 | Quote                                     |
| POST `/cart`         | nftId, edition, quantity                                          | Quote; quantity=0 remove                  |
| GET/POST `/quote`    | POST opcional coupon:string                                       | Quote recalculada                         |
| POST `/orders`       | fingerprint, wallet, network, name, email; header Idempotency-Key | Order, inicialmente pending               |
| GET `/orders/:id`    | —                                                                 | Order autorizado e snapshot               |
| GET/PATCH `/profile` | PATCH name, email, avatar                                         | User                                      |
| POST `/password`     | current, password                                                 | ok                                        |
| GET/POST `/wallets`  | POST id opcional, label, address, network, primary                | Wallet[]                                  |
| POST `/demo`         | scenario                                                          | ok; expired expira sessão                 |
| POST `/demo/event`   | id, action=price/stock/duplicate/disconnect                       | ok; evento pelo transporte                |
| POST `/demo/reset`   | {}                                                                | ok; restauração integral                  |

`User = {id,name,email,avatar}` nunca inclui hash/salt. `Wallet = {id,label,address,network,primary}`. `CartItem = {nftId,edition,quantity}`.

`Quote = {lines,subtotal,discount,fee,total,coupon,fingerprint,valid}`. Cada linha contém nome, imagem, preço, quantidade, edição e estoque. A fingerprint identifica o conteúdo exato revisado. Cálculos usam BigInt em wei (18 casas), inclusive ordenação de preço. A rede tem taxa simulada fixa de 0.001 ETH e JUNGLE10 desconta 10% do subtotal, truncando somente na unidade mínima wei.

`Order = {id,userId,status,version,quote,transaction,createdAt,settleAt,outcome,key,payload}`. Campos de controle outcome/settleAt/key/payload existem no contrato do mock para transparência; não seriam expostos por uma API financeira real.

## Sessão e isolamento

Sessão dura uma hora simulada e é recuperada pela API. Senhas são derivadas com PBKDF2/SHA-256, 100.000 iterações e salt; não são persistidas em claro. Credenciais conhecidas são apenas fixtures. A API protege perfil, carteiras, favoritos e pedidos. Pedidos de outra conta retornam 403. Logout e login cancelam queries, removem o cache e reiniciam subscriptions. Chaves privadas incluem o ID do usuário.

Carrinho de visitante é separado de cada conta. Login mescla quantidades respeitando estoque, preserva os itens e limpa o carrinho visitante. Logout não transforma o carrinho privado em carrinho público. Expiração no checkout encaminha ao login com contexto de retorno.

## Pedidos e consistência

Revisar obtém uma cotação atual pela API. Confirmar revalida essa cotação; diferenças exigem uma nova confirmação. A criação também compara a fingerprint de forma autoritativa. Repetições da mesma chave e payload recuperam o pedido existente; payload diferente retorna 409.

A tentativa (chave + payload + eventual ID) é salva por usuário antes de enviar o pedido. Portanto, timeout após criação e refresh permitem recuperar a mesma compra. Botões ficam desabilitados durante envio e há trava síncrona. Pedidos pendentes reservam unidades para impedir overselling dentro do banco simulado; confirmação/recusa são terminais. O estado é determinado no mock e recuperado por REST após recarga/reconexão.

Recibo é um snapshot clonado na criação. Alterações posteriores não alteram preços ou taxas. Somente confirmação remove quantidades compradas do carrinho; quantidades extras e itens adicionados depois são preservados. Recusa mantém o carrinho. IDs SIM não levam a exploradores reais.

## Socket.IO e reconciliação

Socket.IO usa exclusivamente WebSocket (`transports: ['websocket']`) e namespace padrão. `@mswjs/socket.io-binding` 0.2.0 codifica/decodifica frames Engine.IO/Socket.IO sobre conexões interceptadas por MSW 2.15.0. Não há servidor externo, polling HTTP, extensões de carteira ou blockchain.

MSW remove o prefixo `/socket.io/` ao fazer matching, por isso o handler usa `wss://realtime.greenmint.test/`. Esse hostname nunca precisa resolver na rede real. O cliente é importado após a inicialização do interceptor. Heartbeat Engine.IO mantém a conexão. O binding não pretende reproduzir rooms, namespaces personalizados, acks ou binários; esta demonstração usa eventos JSON de texto.

| Evento        | Payload                                   | Efeito                                                         |
| ------------- | ----------------------------------------- | -------------------------------------------------------------- |
| nft.updated   | id estável do evento, resourceId, version | Invalida catálogo, detalhe, carrinho/cotação e anuncia mudança |
| order.updated | id, resourceId, version, userId           | Reconcilia pedido e carrinho do usuário                        |

Versões menores/iguais são descartadas por recurso. Eventos privados de outra sessão são ignorados. Cleanup remove listeners e fecha socket. Após reconnect, consultas ativas são invalidadas e reconsultadas por REST. Eventos cancelam consultas correspondentes que ainda estão em andamento antes de invalidar e buscar novamente. Isso inclui a primeira consulta sem dados em cache: apenas invalidá-la permite que uma resposta antiga, já em transporte, se torne o resultado final. REST permanece fonte autoritativa. Pedido pendente também faz polling REST a cada 1,5 s como recuperação complementar.

## Cache, falhas e UX

Query staleTime=15 s; retry de consulta no máximo uma vez, exceto 401; mutations não repetem automaticamente. Axios timeout=5 s. Favoritos têm update otimista com snapshot e rollback. Demais mutations aguardam resposta antes de confirmar sucesso. As notificações usam `role=status` e erros `role=alert`; campos inválidos são associados à mensagem. Diálogos usam Radix e navegação mobile usa drawer com controle de foco.

Skeletons possuem shimmer e respeitam prefers-reduced-motion. Imagens e fontes são locais, sem dependência de CDN durante execução. A demonstração explicita simulação; ações não implementadas de suporte/editorial/download não são exibidas como funcionais.

## Limitações e desvios conhecidos

- Figma: direção visual inspecionada, mas fidelidade pixel a pixel e exportação dos assets originais pendentes. Quatro retratos reconstruídos com ImageGen substituem os assets originais (ver ASSETS.md). Tipografia local Roboto Mono aproxima o frame. Estados extras são projetados para legibilidade e teclado.
- Persistência é por origem/navegador. Não há sincronização transacional multiaba ou entre dispositivos; fechar a aba interrompe timers, e a consulta seguinte reconcilia pelo relógio persistido.
- Laboratório é intencionalmente público no build demo; não é endpoint administrativo seguro.
- Endereços de carteira recebem validação sintática, não verificação on-chain.
- Categoria e rede são filtros combináveis entre si, com uma seleção por dimensão. A faixa de preço oferece dois controles deslizantes com aplicação explícita e campos numéricos em “Valores exatos”; não há multi-seleção de categorias.
- O projeto privilegia fluxo completo, contratos e evidência executável. Conta e compra foram separadas em chunks sob demanda. Componentes compartilhados ainda podem ser extraídos de `screens.tsx` para melhorar a manutenção.
- O destino autorizado é leoChaves01/jungle-gaming-frontend-challenge. (com ponto final); evidências da publicação constam em VALIDATION.md.

## Inicialização e performance

O build antecipa o download do chunk de mocks com modulepreload, junto da imagem de destaque e da fonte local. A montagem da aplicação aguarda a ativação do MSW; o Socket.IO é importado depois dessa ativação. O skeleton do detalhe reserva espaço para galeria e informações. Texto, contraste, foco e zoom são verificados nos perfis mobile e desktop. Tailwind analisa somente src, evitando que relatórios de auditoria alterem o CSS gerado. Essas otimizações integram o build normal e não dependem de detecção de Lighthouse.

A separação das rotas e do menu reduziu o chunk inicial de 505,45 para 458,31 kB antes de gzip. O build deixou de emitir o aviso de chunk acima de 500 kB; a meta Lighthouse mobile é avaliada separadamente nos relatórios.

O drawer mobile usa import dinâmico em src/menu-drawer.tsx. A biblioteca de diálogo é baixada quando o menu é aberto; Radix continua controlando o foco, Escape e fechamento, com retorno explícito ao botão acionador.

## Resposta inválida na abertura

Foi observado um TypeError no cabeçalho ao reduzir `cart.lines` inexistente. A borda HTTP agora rejeita respostas não JSON (inclusive fallback HTML de SPA com status 200) e cotações sem lista de linhas antes de armazená-las em cache. O cabeçalho protege a leitura e apresenta erro recuperável; o root possui uma tela de recuperação em português. O cenário `invalid-response` reproduz a resposta HTML via MSW, inclusive após refresh, com cobertura desktop/mobile. Não foi possível recuperar o corpo da resposta original da aba; HTML de fallback é uma hipótese coberta, não uma causa confirmada por captura de rede.

O login/cadastro usa Radix Dialog com fundo de catálogo inerte, foco contido e Escape. Busca/coleções/editorial permanecem componentes reais da aplicação. Ações fora do escopo mostram indisponibilidade explícita. “Em alta” ordena por versão do NFT e id (critério determinístico da simulação); “Novos lançamentos” ordena id decrescente. Ambos compõem o estado da URL.

O preview aplica compressão HTTP negociada (gzip/Brotli) a todos os clientes por middleware `compression`, sem modificar o conteúdo dos assets. Isso torna o servidor local de auditoria mais próximo da hospedagem estática de produção. A versão anterior do preview entregava JavaScript sem `Content-Encoding`; as auditorias anteriores são preservadas como diagnóstico. O middleware não participa do bundle do navegador nem remove funcionalidades.


O catálogo prioriza o carregamento das três primeiras imagens, que já aparecem na primeira tela mobile. A consulta REST inicial fornece o primeiro snapshot; a invalidação geral do socket ocorre nas reconexões, evitando uma segunda consulta na primeira conexão. Eventos continuam cancelando consultas em andamento e reconciliando os recursos afetados. Os links do rodapé possuem alvo mínimo de 24 px, e ícones decorativos ficam fora do nome acessível.


