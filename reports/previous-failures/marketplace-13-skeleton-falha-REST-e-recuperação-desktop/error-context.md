# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> 13 skeleton, falha REST e recuperação
- Location: tests\marketplace.spec.ts:306:1

# Error details

```
Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - link "Pular para conteúdo" [ref=f1e3] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=f1e4]: Uma nova forma de colecionar. Ambiente demonstrativo • sem pagamentos reais
  - banner [ref=f1e5]:
    - link "G GreenMint ®" [ref=f1e6] [cursor=pointer]:
      - /url: /
      - generic [ref=f1e7]: G
      - text: GreenMint
      - generic [ref=f1e8]: ®
    - navigation "Principal" [ref=f1e9]:
      - link "Explorar" [ref=f1e10] [cursor=pointer]:
        - /url: /
      - link "Favoritos" [ref=f1e11] [cursor=pointer]:
        - /url: /favorites
      - link "Carteiras" [ref=f1e12] [cursor=pointer]:
        - /url: /wallets
      - link "Minha conta" [ref=f1e13] [cursor=pointer]:
        - /url: /profile
    - generic [ref=f1e14]:
      - link "Carrinho (0)" [ref=f1e15] [cursor=pointer]:
        - /url: /cart
        - generic [ref=f1e19]: "0"
      - link "Entrar" [ref=f1e20] [cursor=pointer]:
        - /url: /login
  - main [ref=f1e21]:
    - alert [ref=f1e22]:
      - text: Serviço temporariamente indisponível. Tente novamente.
      - button "Tentar novamente" [ref=f1e23] [cursor=pointer]
  - generic [ref=f1e24]:
    - generic [ref=f1e25]:
      - heading "Colecione com confiança" [level=3] [ref=f1e29]
      - paragraph [ref=f1e30]: Transparência em cada detalhe.
    - generic [ref=f1e31]:
      - heading "Sua coleção, suas escolhas" [level=3] [ref=f1e35]
      - paragraph [ref=f1e36]: Carteiras e redes em um só lugar.
    - generic [ref=f1e37]:
      - heading "Descubra o extraordinário" [level=3] [ref=f1e42]
      - paragraph [ref=f1e43]: Arte digital de novos criadores.
  - contentinfo [ref=f1e44]:
    - generic [ref=f1e45]:
      - link "GreenMint®" [ref=f1e46] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f1e47]: Arte, comunidade e novas possibilidades.
    - navigation "Rodapé" [ref=f1e48]:
      - link "Marketplace" [ref=f1e49] [cursor=pointer]:
        - /url: /
      - link "Meu perfil" [ref=f1e50] [cursor=pointer]:
        - /url: /profile
      - link "Minhas carteiras" [ref=f1e51] [cursor=pointer]:
        - /url: /wallets
    - paragraph [ref=f1e52]: © 2026 GreenMint. Projeto demonstrativo.
    - group [ref=f1e53]:
      - generic "Laboratório de demonstração" [active] [ref=f1e54] [cursor=pointer]
      - option "normal"
      - option "slow"
      - option "race"
      - option "offline"
      - option "server-error" [selected]
      - option "expired"
      - option "favorite-error"
      - option "declined"
      - option "timeout"
      - option "pending"
```