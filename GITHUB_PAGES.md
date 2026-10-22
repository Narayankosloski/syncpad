# SyncPad no GitHub Pages + Firebase

## Opção recomendada: GitHub Actions

Envie o conteúdo do projeto para um repositório GitHub e mantenha o workflow em `.github/workflows/deploy-pages.yml`. Ele instala as dependências, detecta automaticamente se o repositório é `usuario.github.io` ou uma página de projeto, define a base correta e publica `dist/public` no GitHub Pages.

No GitHub, abra **Settings → Pages**, selecione **GitHub Actions** como fonte e faça um push na branch `main`. O workflow cuidará do build e da publicação.

## Configuração do Firebase

No Firebase Console do projeto `syncpad-75475`:

1. Em **Build → Firestore Database**, crie o banco em modo de produção.
2. Em **Build → Authentication → Sign-in method**, habilite **Google**.
3. Em **Authentication → Settings → Authorized domains**, adicione o domínio final do GitHub Pages, por exemplo `usuario.github.io`.
4. Publique as regras deste repositório com Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

O arquivo `.firebaserc` já aponta para `syncpad-75475`, e `firebase.json` aponta para `firestore.rules`.

## Publicação manual

Para um repositório `usuario.github.io` na raiz do domínio:

```bash
pnpm install
VITE_BASE_PATH=/ pnpm build:github-pages
```

Envie o conteúdo de `dist/public` para a branch configurada no Pages. O arquivo `404.html` já é criado para permitir abrir links compartilhados diretamente.

Para um repositório de projeto, como `usuario.github.io/syncpad`, use o workflow automático. Ele define `VITE_BASE_PATH=/syncpad/` sem precisar editar o código.

## Segurança

A configuração Web do Firebase presente no cliente é pública por design. A segurança dos dados fica nas regras do Firestore. O modelo atual permite leitura e edição de documentos marcados como públicos, para que o compartilhamento por link funcione; documentos vinculados a uma conta Google recebem `ownerUid` e aparecem na lista dessa conta.
