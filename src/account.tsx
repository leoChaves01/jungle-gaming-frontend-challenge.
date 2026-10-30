import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Eye, EyeOff, X, Wallet as WalletIcon } from 'lucide-react';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { api, beginSessionTransition, get, post, queryClient } from './api';
import { Button } from './components/ui/button';
import type { NFT, User, Wallet } from './contracts';
import { Card, ErrorBox, Field, Head, Home, Select, Skeleton, useSession } from './screens';
export function Auth({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  const [error, setError] = useState('');
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [auxiliary, setAuxiliary] = useState('');
  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      await beginSessionTransition();
      return post<User>(register ? '/register' : '/login', data);
    },
    onSuccess: async (user) => {
      await queryClient.cancelQueries();
      queryClient.clear();
      queryClient.setQueryData(['session'], user);
      await navigate({ to: (search.returnTo || '/') as '/' });
    },
  });
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (register && data.password !== data.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    mutation.mutate(data);
  }
  return (
    <>
      <div className="auth-background" inert aria-hidden="true">
        <Home />
      </div>
      <Dialog.Root
        open
        onOpenChange={(open) => {
          if (!open) void navigate({ to: '/' });
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="auth-overlay" />
          <Dialog.Content
            className="auth-modal"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              requestAnimationFrame(() => {
                const target =
                  document.querySelector<HTMLElement>('header a[href="/login"]') ||
                  document.querySelector<HTMLElement>('#main');
                target?.focus();
              });
            }}
          >
            <Dialog.Title className="auth-tabs">
              <Link to="/login" search={{ returnTo: search.returnTo }} data-active={!register}>
                Entrar
              </Link>
              <span>|</span>
              <Link to="/register" search={{ returnTo: search.returnTo }} data-active={register}>
                Criar conta
              </Link>
            </Dialog.Title>
            <Dialog.Description className="auth-description">
              Entre para gerenciar sua carteira, coleção e perfil de criador.
            </Dialog.Description>
            <Dialog.Close className="auth-close" aria-label="Fechar login">
              <X size={18} />
            </Dialog.Close>
            <form className="auth-form panel stack" onSubmit={submit}>
              <h2 className="sr-only">{register ? 'Crie sua conta' : 'Bom ter você de volta'}</h2>
              {register && (
                <Field
                  label="Nome completo"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                />
              )}
              <Field label="E-mail" name="email" type="email" autoComplete="email" required />
              <div className="password-control">
                <Field
                  label="Senha"
                  name="password"
                  type={visiblePassword ? 'text' : 'password'}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  required
                  minLength={8}
                  aria-describedby="auth-hint"
                />
                <button
                  type="button"
                  aria-label={visiblePassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={visiblePassword}
                  onClick={() => setVisiblePassword(!visiblePassword)}
                >
                  {visiblePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!register && (
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setAuxiliary(
                      'Recuperação por e-mail não disponível. Use a conta demonstrativa indicada abaixo.',
                    )
                  }
                >
                  Esqueceu a senha?
                </button>
              )}
              {register && (
                <Field
                  label="Confirmar senha"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              )}
              <p id="auth-hint">Use pelo menos 8 caracteres. Demo: ana@demo.com / Demo123!</p>
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              {mutation.error && <ErrorBox error={mutation.error} />}
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar na conta'}
              </Button>
              <p>
                {register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
                <Link to={register ? '/login' : '/register'}>
                  {register ? 'Entrar' : 'Cadastre-se'}
                </Link>
              </p>
              <div className="social-auth">
                <p>Ou continue com</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setAuxiliary('Login Google não disponível na demonstração. Use e-mail e senha.')
                  }
                >
                  G · Continuar com Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setAuxiliary(
                      'Login Facebook não disponível na demonstração. Use e-mail e senha.',
                    )
                  }
                >
                  f · Continuar com Facebook
                </Button>
              </div>
              {auxiliary && <p role="status">{auxiliary}</p>}
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head title="Minha conta" subtitle="Seu espaço no universo Kurio." />
      <div className="account-grid">
        <nav aria-label="Conta" className="account-nav">
          <Link to="/profile">Perfil do colecionador</Link>
          <Link to="/wallets">Minhas carteiras</Link>
          <Link to="/favorites">Favoritos</Link>
        </nav>
        <div>{children}</div>
      </div>
    </>
  );
}
export function Profile() {
  const { data: user } = useSession();
  const profile = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: ({ signal }) => get<User>('/profile', signal),
  });
  const [avatar, setAvatar] = useState(''),
    [feedback, setFeedback] = useState('');
  const update = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.patch('/profile', data),
    onSuccess: () => {
      setFeedback('Perfil atualizado.');
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
  const password = useMutation({
    mutationFn: (data: Record<string, string>) => post('/password', data),
    onSuccess: () => setFeedback('Senha alterada com sucesso.'),
  });
  return (
    <AccountLayout>
      {profile.isPending ? (
        <Skeleton />
      ) : profile.error ? (
        <ErrorBox error={profile.error} />
      ) : (
        <>
          <form
            key={profile.data.email}
            className="panel stack"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({
                ...Object.fromEntries(new FormData(e.currentTarget)),
                avatar: avatar || profile.data.avatar,
              });
            }}
          >
            <h2>Perfil do colecionador</h2>
            <img
              className="avatar"
              src={avatar || profile.data.avatar}
              width="80"
              height="80"
              alt="Seu avatar"
            />
            <Field
              label="Alterar avatar (PNG, JPEG ou WebP, até 200 KB)"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (
                  f.size > 200000 ||
                  !['image/png', 'image/jpeg', 'image/webp'].includes(f.type)
                ) {
                  setFeedback('Escolha uma imagem PNG, JPEG ou WebP de até 200 KB.');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setAvatar(String(reader.result));
                reader.readAsDataURL(f);
              }}
            />
            <Field
              label="Nome completo"
              name="name"
              defaultValue={profile.data.name}
              required
              minLength={2}
            />
            <Field
              label="E-mail"
              name="email"
              type="email"
              defaultValue={profile.data.email}
              required
            />
            <Button type="submit" disabled={update.isPending}>
              Salvar perfil
            </Button>
            {update.error && <ErrorBox error={update.error} />}
          </form>
          <form
            className="panel stack"
            onSubmit={(e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<
                string,
                string
              >;
              if (data.password !== data.confirm) {
                setFeedback('As senhas não coincidem.');
                return;
              }
              password.mutate(data);
            }}
          >
            <h2>Alterar senha</h2>
            <Field
              label="Senha atual"
              name="current"
              type="password"
              autoComplete="current-password"
              required
            />
            <Field
              label="Nova senha"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Field
              label="Confirmar nova senha"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Button type="submit" disabled={password.isPending}>
              Alterar senha
            </Button>
            {password.error && <ErrorBox error={password.error} />}
          </form>
          <p role="status">{feedback}</p>
        </>
      )}
    </AccountLayout>
  );
}
export function Wallets() {
  const opener = useRef<HTMLButtonElement | null>(null);
  const { data: user } = useSession();
  const wallets = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: ({ signal }) => get<Wallet[]>('/wallets', signal),
  });
  const [editing, setEditing] = useState<Wallet | null>(null),
    [open, setOpen] = useState(false),
    [feedback, setFeedback] = useState('');
  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => post('/wallets', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setOpen(false);
      setFeedback('Carteira salva.');
    },
  });
  return (
    <AccountLayout>
      <div className="section-title">
        <h2>Minhas carteiras</h2>
        <Button
          onClick={(event) => {
            opener.current = event.currentTarget;
            setEditing(null);
            mutation.reset();
            setOpen(true);
          }}
          disabled={(wallets.data?.length || 0) >= 2}
        >
          Adicionar carteira
        </Button>
      </div>
      {wallets.isPending ? (
        <Skeleton />
      ) : wallets.error ? (
        <ErrorBox error={wallets.error} />
      ) : (
        wallets.data.map((w) => (
          <article className="panel wallet-card" key={w.id}>
            <WalletIcon />
            <div>
              <h3>
                {w.label} {w.primary && <span className="badge">Principal</span>}
              </h3>
              <p>{w.network}</p>
              <p className="break">{w.address}</p>
            </div>
            <Button
              variant="outline"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setEditing(w);
                mutation.reset();
                setOpen(true);
              }}
            >
              Editar
            </Button>
          </article>
        ))
      )}
      {!wallets.isPending && !wallets.data?.length && <p>Nenhuma carteira cadastrada.</p>}
      <p role="status">{feedback}</p>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay" />
          <Dialog.Content
            className="dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              opener.current?.focus();
            }}
          >
            <Dialog.Title>{editing ? 'Editar carteira' : 'Adicionar carteira'}</Dialog.Title>
            <Dialog.Description>
              Cadastre uma carteira fictícia para suas compras simuladas.
            </Dialog.Description>
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                mutation.mutate({
                  ...data,
                  id: editing?.id || '',
                  primary: data.primary === 'on',
                });
              }}
            >
              <Field label="Nome da carteira" name="label" defaultValue={editing?.label} required />
              <Field
                label="Endereço da carteira"
                name="address"
                defaultValue={editing?.address}
                placeholder={'0x' + 'a'.repeat(40)}
                pattern="0x[0-9a-fA-F]{40}"
                required
              />
              <Select
                label="Rede da carteira"
                name="network"
                defaultValue={editing?.network || 'Ethereum'}
              >
                <option>Ethereum</option>
                <option>Polygon</option>
              </Select>
              <label className="check">
                <input type="checkbox" name="primary" defaultChecked={editing?.primary} />
                Definir como principal
              </label>
              {mutation.error && <ErrorBox error={mutation.error} />}
              <Button type="submit" disabled={mutation.isPending}>
                Salvar carteira
              </Button>
              <Dialog.Close asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Dialog.Close>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AccountLayout>
  );
}
export function Favorites() {
  const { data: user } = useSession();
  const favorites = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: ({ signal }) => get<string[]>('/favorites', signal),
  });
  const catalog = useQuery({
    queryKey: ['favorite-nfts', favorites.data],
    queryFn: () => Promise.all(favorites.data!.map((id) => get<NFT>('/nfts/' + id))),
    enabled: !!favorites.data,
  });
  return (
    <AccountLayout>
      <h2>Seus favoritos</h2>
      {favorites.error || catalog.error ? (
        <ErrorBox error={favorites.error || catalog.error} />
      ) : favorites.isPending || catalog.isPending ? (
        <Skeleton cards />
      ) : catalog.data.length ? (
        <div className="cards">
          {catalog.data.map((n) => (
            <Card key={n.id} nft={n} />
          ))}
        </div>
      ) : (
        <p>Você ainda não tem favoritos. Explore o marketplace e salve suas obras preferidas.</p>
      )}
    </AccountLayout>
  );
}
