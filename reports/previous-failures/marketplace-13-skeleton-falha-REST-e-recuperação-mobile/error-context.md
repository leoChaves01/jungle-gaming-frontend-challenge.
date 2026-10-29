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
  - generic [ref=f1e4]: Uma nova forma de colecionar.
  - banner [ref=f1e5]:
    - link "G GreenMint ®" [ref=f1e6] [cursor=pointer]:
      - /url: /
      - generic [ref=f1e7]: G
      - text: GreenMint
      - generic [ref=f1e8]: ®
    - generic [ref=f1e9]:
      - link "Carrinho (0)" [ref=f1e10] [cursor=pointer]:
        - /url: /cart
        - generic [ref=f1e14]: "0"
      - link "Entrar" [ref=f1e15] [cursor=pointer]:
        - /url: /login
      - button "Abrir menu" [ref=f1e16] [cursor=pointer]
  - main [ref=f1e18]:
    - alert [ref=f1e19]:
      - text: Serviço temporariamente indisponível. Tente novamente.
      - button "Tentar novamente" [ref=f1e20] [cursor=pointer]
  - generic [ref=f1e21]:
    - generic [ref=f1e22]:
      - heading "Colecione com confiança" [level=3] [ref=f1e26]
      - paragraph [ref=f1e27]: Transparência em cada detalhe.
    - generic [ref=f1e28]:
      - heading "Sua coleção, suas escolhas" [level=3] [ref=f1e32]
      - paragraph [ref=f1e33]: Carteiras e redes em um só lugar.
    - generic [ref=f1e34]:
      - heading "Descubra o extraordinário" [level=3] [ref=f1e39]
      - paragraph [ref=f1e40]: Arte digital de novos criadores.
  - contentinfo [ref=f1e41]:
    - generic [ref=f1e42]:
      - link "GreenMint®" [ref=f1e43] [cursor=pointer]:
        - /url: /
      - paragraph [ref=f1e44]: Arte, comunidade e novas possibilidades.
    - navigation "Rodapé" [ref=f1e45]:
      - link "Marketplace" [ref=f1e46] [cursor=pointer]:
        - /url: /
      - link "Meu perfil" [ref=f1e47] [cursor=pointer]:
        - /url: /profile
      - link "Minhas carteiras" [ref=f1e48] [cursor=pointer]:
        - /url: /wallets
    - paragraph [ref=f1e49]: © 2026 GreenMint. Projeto demonstrativo.
    - group [ref=f1e50]:
      - generic "Laboratório de demonstração" [active] [ref=f1e51] [cursor=pointer]
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