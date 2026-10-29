# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> 04 favoritos otimistas: rollback, persistência e isolamento
- Location: tests\marketplace.spec.ts:114:1

# Error details

```
Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f2e2]:
  - link "Pular para conteúdo" [ref=f2e3] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=f2e4]: Uma nova forma de colecionar. Ambiente demonstrativo • sem pagamentos reais
  - banner [ref=f2e5]:
    - link "G GreenMint ®" [ref=f2e6] [cursor=pointer]:
      - /url: /
      - generic [ref=f2e7]: G
      - text: GreenMint
      - generic [ref=f2e8]: ®
    - navigation "Principal" [ref=f2e9]:
      - link "Explorar" [ref=f2e10] [cursor=pointer]:
        - /url: /
      - link "Favoritos" [ref=f2e11] [cursor=pointer]:
        - /url: /favorites
      - link "Carteiras" [ref=f2e12] [cursor=pointer]:
        - /url: /wallets
      - link "Minha conta" [ref=f2e13] [cursor=pointer]:
        - /url: /profile
    - generic [ref=f2e14]:
      - link "Carrinho (0)" [ref=f2e15] [cursor=pointer]:
        - /url: /cart
        - generic [ref=f2e19]: "0"
      - button "Sair" [ref=f2e20] [cursor=pointer]
  - main [ref=f2e21]:
    - generic [ref=f2e22]:
      - link "Marketplace" [ref=f2e23] [cursor=pointer]:
        - /url: /
      - generic [ref=f2e24]: /
      - text: "Bored Jungle #100"
    - generic [ref=f2e25]:
      - generic [ref=f2e26]:
        - 'img "Bored Jungle #100" [ref=f2e27]'
        - generic [ref=f2e28]:
          - button "Ver arte completa" [pressed] [ref=f2e29] [cursor=pointer]
          - button "Ver detalhe da arte" [ref=f2e30] [cursor=pointer]
      - generic [ref=f2e31]:
        - paragraph [ref=f2e32]: Arte · Polygon
        - 'heading "Bored Jungle #100" [level=1] [ref=f2e33]'
        - paragraph [ref=f2e34]:
          - text: Criado por
          - strong [ref=f2e35]: Satoshi Studio
          - text: ✓
        - paragraph [ref=f2e36]: Uma expressão original da cultura digital. Cores, personalidade e uma história para fazer parte da sua coleção.
        - generic [ref=f2e37]:
          - text: Preço por unidade
          - strong [ref=f2e38]: 0.0125 ETH
          - paragraph [ref=f2e39]: 8 unidades disponíveis
        - generic [ref=f2e40]:
          - generic [ref=f2e41]:
            - generic [ref=f2e42]: Edição
            - combobox "Edição" [ref=f2e43]:
              - option "Original" [selected]
              - option "Edição rara — indisponível"
          - generic [ref=f2e44]:
            - generic [ref=f2e45]: Quantidade
            - spinbutton "Quantidade" [ref=f2e46]: "1"
        - generic [ref=f2e47]:
          - button "Adicionar ao carrinho" [ref=f2e48] [cursor=pointer]
          - button "Favoritar NFT" [ref=f2e52] [cursor=pointer]: Favorito
          - alert [ref=f2e55]: Não foi possível salvar o favorito.
        - status
        - group [ref=f2e56]:
          - generic "Detalhes da coleção" [ref=f2e57] [cursor=pointer]
    - generic [ref=f2e58]:
      - heading "Sobre esta obra" [level=2] [ref=f2e59]
      - paragraph [ref=f2e60]: Encontre novas perspectivas através da arte digital. Esta peça integra a coleção de Satoshi Studio no GreenMint. Todos os itens desta demonstração são simulados.
  - generic [ref=f2e61]:
    - generic [ref=f2e62]:
      - heading "Colecione com confiança" [level=3] [ref=f2e66]
      - paragraph [ref=f2e67]: Transparência em cada detalhe.
    - generic [ref=f2e68]:
      - heading "Sua coleção, suas escolhas" [level=3] [ref=f2e72]
      - paragraph [ref=f2e73]: Carteiras e redes em um só lugar.
    - generic [ref=f2e74]:
      - heading "Descubra o extraordinário" [level=3] [ref=f2e79]
      - paragraph [ref=f2e80]: Arte digital de novos criadores.
  - contentinfo [ref=f2e81]:
    - generic [ref=f2e82]:
      - link "GreenMint®" [ref=f2e83] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f2e84]: Arte, comunidade e novas possibilidades.
    - navigation "Rodapé" [ref=f2e85]:
      - link "Marketplace" [ref=f2e86] [cursor=pointer]:
        - /url: /
      - link "Meu perfil" [ref=f2e87] [cursor=pointer]:
        - /url: /profile
      - link "Minhas carteiras" [ref=f2e88] [cursor=pointer]:
        - /url: /wallets
    - paragraph [ref=f2e89]: © 2026 GreenMint. Projeto demonstrativo.
    - group [ref=f2e90]:
      - generic "Laboratório de demonstração" [active] [ref=f2e91] [cursor=pointer]
      - option "normal"
      - option "slow"
      - option "race"
      - option "offline"
      - option "server-error"
      - option "expired"
      - option "favorite-error" [selected]
      - option "declined"
      - option "timeout"
      - option "pending"
```