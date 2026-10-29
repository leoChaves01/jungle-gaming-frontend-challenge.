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
  - generic [ref=f2e4]: Uma nova forma de colecionar.
  - banner [ref=f2e5]:
    - link "G GreenMint ®" [ref=f2e6] [cursor=pointer]:
      - /url: /
      - generic [ref=f2e7]: G
      - text: GreenMint
      - generic [ref=f2e8]: ®
    - generic [ref=f2e9]:
      - link "Carrinho (0)" [ref=f2e10] [cursor=pointer]:
        - /url: /cart
        - generic [ref=f2e14]: "0"
      - button "Sair" [ref=f2e15] [cursor=pointer]
      - button "Abrir menu" [ref=f2e16] [cursor=pointer]
  - main [ref=f2e18]:
    - generic [ref=f2e19]:
      - link "Marketplace" [ref=f2e20] [cursor=pointer]:
        - /url: /
      - generic [ref=f2e21]: /
      - text: "Bored Jungle #100"
    - generic [ref=f2e22]:
      - generic [ref=f2e23]:
        - 'img "Bored Jungle #100" [ref=f2e24]'
        - generic [ref=f2e25]:
          - button "Ver arte completa" [pressed] [ref=f2e26] [cursor=pointer]
          - button "Ver detalhe da arte" [ref=f2e27] [cursor=pointer]
      - generic [ref=f2e28]:
        - paragraph [ref=f2e29]: Arte · Polygon
        - 'heading "Bored Jungle #100" [level=1] [ref=f2e30]'
        - paragraph [ref=f2e31]:
          - text: Criado por
          - strong [ref=f2e32]: Satoshi Studio
          - text: ✓
        - paragraph [ref=f2e33]: Uma expressão original da cultura digital. Cores, personalidade e uma história para fazer parte da sua coleção.
        - generic [ref=f2e34]:
          - text: Preço por unidade
          - strong [ref=f2e35]: 0.0125 ETH
          - paragraph [ref=f2e36]: 8 unidades disponíveis
        - generic [ref=f2e37]:
          - generic [ref=f2e38]:
            - generic [ref=f2e39]: Edição
            - combobox "Edição" [ref=f2e40]:
              - option "Original" [selected]
              - option "Edição rara — indisponível"
          - generic [ref=f2e41]:
            - generic [ref=f2e42]: Quantidade
            - spinbutton "Quantidade" [ref=f2e43]: "1"
        - generic [ref=f2e44]:
          - button "Adicionar ao carrinho" [ref=f2e45] [cursor=pointer]
          - button "Favoritar NFT" [ref=f2e49] [cursor=pointer]: Favorito
          - alert [ref=f2e52]: Não foi possível salvar o favorito.
        - status
        - group [ref=f2e53]:
          - generic "Detalhes da coleção" [ref=f2e54] [cursor=pointer]
    - generic [ref=f2e55]:
      - heading "Sobre esta obra" [level=2] [ref=f2e56]
      - paragraph [ref=f2e57]: Encontre novas perspectivas através da arte digital. Esta peça integra a coleção de Satoshi Studio no GreenMint. Todos os itens desta demonstração são simulados.
  - generic [ref=f2e58]:
    - generic [ref=f2e59]:
      - heading "Colecione com confiança" [level=3] [ref=f2e63]
      - paragraph [ref=f2e64]: Transparência em cada detalhe.
    - generic [ref=f2e65]:
      - heading "Sua coleção, suas escolhas" [level=3] [ref=f2e69]
      - paragraph [ref=f2e70]: Carteiras e redes em um só lugar.
    - generic [ref=f2e71]:
      - heading "Descubra o extraordinário" [level=3] [ref=f2e76]
      - paragraph [ref=f2e77]: Arte digital de novos criadores.
  - contentinfo [ref=f2e78]:
    - generic [ref=f2e79]:
      - link "GreenMint®" [ref=f2e80] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f2e81]: Arte, comunidade e novas possibilidades.
    - navigation "Rodapé" [ref=f2e82]:
      - link "Marketplace" [ref=f2e83] [cursor=pointer]:
        - /url: /
      - link "Meu perfil" [ref=f2e84] [cursor=pointer]:
        - /url: /profile
      - link "Minhas carteiras" [ref=f2e85] [cursor=pointer]:
        - /url: /wallets
    - paragraph [ref=f2e86]: © 2026 GreenMint. Projeto demonstrativo.
    - group [ref=f2e87]:
      - generic "Laboratório de demonstração" [active] [ref=f2e88] [cursor=pointer]
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