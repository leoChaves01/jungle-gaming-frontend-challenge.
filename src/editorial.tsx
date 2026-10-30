import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from './components/ui/button';

const stories = [
  [
    'ivory',
    'Como funciona a propriedade de NFTs',
    'Aprenda a colecionar, negociar e verificar ativos digitais.',
  ],
  [
    'emerald',
    '10 artistas digitais para acompanhar',
    'Conheça criadores que moldam a cultura digital.',
  ],
  [
    'sage',
    'Raridade, atributos e procedência',
    'Entenda raridade, procedência, direitos autorais e utilidade.',
  ],
  ['golden', 'Como proteger sua carteira', 'Proteja sua carteira, seus ativos e sua identidade.'],
];
export function Editorial() {
  const [article, setArticle] = useState<string | null>(null);
  return (
    <>
      <section className="promo-grid" aria-label="Destaques de coleções" id="creators">
        <div className="promo-card">
          <img
            src="/art/emerald-small.webp"
            width="180"
            height="180"
            alt="Emerald Ape"
            loading="lazy"
          />
          <div>
            <h2>Lançamentos gênesis de edição limitada</h2>
            <p>Colecione edições escassas diretamente dos criadores antes da revelação pública.</p>
            <Link to="/" search={{ category: 'Colecionáveis' }} hash="catalog">
              Explorar →
            </Link>
          </div>
        </div>
        <div className="promo-card">
          <img
            src="/art/ivory-small.webp"
            width="180"
            height="180"
            alt="Ivory Baron"
            loading="lazy"
          />
          <div>
            <h2>Arte digital selecionada e muito mais</h2>
            <p>
              Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.
            </p>
            <Link to="/" search={{ category: 'Arte' }} hash="catalog">
              Explorar →
            </Link>
          </div>
        </div>
      </section>
      <section className="journal" id="journal" aria-labelledby="journal-title">
        <h2 id="journal-title">Diário da Cunhagem</h2>
        <p>
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
        <div className="journal-grid">
          {stories.map(([image, title, description], i) => (
            <article key={title}>
              <img
                src={`/art/${image}-small.webp`}
                width="320"
                height="240"
                alt=""
                loading="lazy"
              />
              <div>
                <small>
                  {12 + i} de setembro · Leitura de {i + 3} min
                </small>
                <h3>{title}</h3>
                <p>{description}</p>
                <button onClick={() => setArticle(title)}>
                  Ler mais <span className="sr-only">sobre {title}</span> →
                </button>
              </div>
            </article>
          ))}
        </div>
        {article && (
          <p role="status" className="editorial-notice">
            “{article}”: conteúdo editorial não disponível nesta demonstração.{' '}
            <button onClick={() => setArticle(null)}>Fechar aviso</button>
          </p>
        )}
      </section>
    </>
  );
}
export function ReferenceFooter({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState('');
  const auxiliary = (label: string) => (
    <button onClick={() => setNotice(`${label}: recurso fora do escopo desta demonstração.`)}>
      {label}
    </button>
  );
  return (
    <footer className="reference-footer">
      <section className="footer-benefits" aria-label="Serviços Kurio">
        {[
          [
            'W',
            'Segurança da carteira',
            'Proteja sua carteira e colecione arte digital verificada com confiança.',
          ],
          [
            'C',
            'Criadores em destaque',
            'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
          ],
          [
            'D',
            'Alertas de lançamentos',
            'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
          ],
        ].map(([icon, title, body]) => (
          <div key={title}>
            <span className="benefit-icon" aria-hidden="true">
              {icon}
            </span>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setNotice('Newsletter demonstrativa: nenhum e-mail foi enviado ou cadastrado.');
          }}
        >
          <h3>Antecipe-se ao próximo lançamento</h3>
          <div className="newsletter">
            <input
              type="email"
              aria-label="E-mail para novidades"
              placeholder="Digite seu e-mail..."
              required
            />
            <Button type="submit">Enviar</Button>
          </div>
          <p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p>
        </form>
      </section>
      <div className="footer-brand">
        <Link to="/">KURIO</Link>
        <p>
          Feito para colecionadores,
          <br />
          criadores e cultura.
        </p>
        <span>contato@email.com</span>
        <span>+55 11 4002 8922</span>
      </div>
      <nav className="footer-columns" aria-label="Rodapé">
        <div>
          <h3>Meu perfil</h3>
          <Link to="/profile">Meu perfil</Link>
          <Link to="/favorites">Minha coleção</Link>
          {auxiliary('Atividade')}
          {auxiliary('Estúdio do criador')}
          <Link to="/favorites">Lista de interesse</Link>
        </div>
        <div>
          <h3>Central de ajuda</h3>
          {[
            'Central de ajuda',
            'Como comprar NFTs',
            'Carteira e segurança',
            'Política do mercado',
            'Denunciar item',
          ].map((label) => (
            <span key={label}>{auxiliary(label)}</span>
          ))}
        </div>
        <div>
          <h3>Coleções</h3>
          {['Arte', 'Fotografia', 'Colecionáveis', 'Gaming'].map((category) => (
            <Link key={category} to="/" search={{ category }} hash="catalog">
              {category === 'Arte' ? 'Arte digital' : category}
            </Link>
          ))}
        </div>
        <div>
          <h3>Redes sociais</h3>
          <div className="social-links">
            {['Facebook', 'Instagram', 'X', 'LinkedIn', 'YouTube'].map((label, i) => (
              <button
                key={label}
                aria-label={label}
                onClick={() =>
                  setNotice(`${label}: a Kurio demonstrativa não possui perfil oficial.`)
                }
              >
                <span aria-hidden="true">{['f', '◎', '𝕏', 'in', '▶'][i]}</span>
              </button>
            ))}
          </div>
          <h3>Carteiras compatíveis</h3>
          <p className="wallet-brands">METAMASK · WALLETCONNECT · COINBASE</p>
        </div>
      </nav>
      {notice && (
        <p role="status" className="editorial-notice">
          {notice} <button onClick={() => setNotice('')}>Fechar aviso</button>
        </p>
      )}
      <p className="copyright">
        © 2026 Kurio. Propriedade digital para todos.{' '}
        <span>Demonstração sem pagamentos reais.</span>
      </p>
      {children}
    </footer>
  );
}
