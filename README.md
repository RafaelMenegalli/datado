# Datado

Jogo diário brasileiro: cinco fotos históricas, adivinhe o ano e o lugar. Next.js 15 (App Router) + TypeScript, Neon PostgreSQL, mapa MapLibre GL com tiles do OpenFreeMap (© OpenStreetMap).

## Rodar

```powershell
npm install
npm run dev
```

Sem `DATABASE_URL` o app usa a edição #1 embutida em `lib/server/prototype-data.ts`.

## Banco (Neon)

1. Copie `.env.example` para `.env.local` e preencha `DATABASE_URL`.
2. `npm run db:seed` cria as tabelas (`db/schema.sql`) e a edição #1.

Se não houver edição agendada para o dia, a edição mais recente é reutilizada com a data de hoje (só para o protótipo; para produção, agende uma edição por dia).

## Estrutura

- `app/` — rotas (`/`, `/jogar`, `/resultado`) e API (`/api/edition/today`, `/api/edition/[id]`, `/api/edition/[id]/reveal/[photoIndex]`, índice 0–4)
- `lib/` — pontuação, geo, datas, storage/estatísticas, contexto do jogo
- `components/` — UI (mapa, slider de ano, cartão de foto, modais)

## Segurança: impedir que o jogador descubra a resposta

- **Antes do palpite, o navegador só recebe a imagem.** `/api/edition/today` não envia título, ano, local, legenda, fonte nem id. O texto alternativo é genérico ("Foto 3").
- **A resposta de cada foto só sai por `POST /api/edition/[id]/reveal/[photoIndex]`**, depois de um palpite válido, na ordem (0 → 4) e com um *token de progresso* assinado (HMAC) emitido pelo servidor. Não existe `GET`. Token forjado, fora de ordem ou de outra edição é recusado, e há um intervalo mínimo de 1,5 s por foto.
- **O token guarda só a contagem de fotos reveladas**, nunca respostas. Não há cookies.
- **Edições futuras não existem para a API** (404). Só a edição de hoje e as já encerradas são servidas.
- **Imagens:** hospedadas no próprio site (nada de link para o Commons, que tem o nome do lugar), com nome aleatório e sem EXIF/IPTC/XMP. Os arquivos ficam em `public/images/fotos/`.
- **Nada de segredos no cliente:** a build não gera source maps, e `lib/server/*` nunca é importado por código de navegador.
- **Configuração:** defina `DATADO_SECRET` (mínimo 16 caracteres; `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`). Em produção o servidor se recusa a responder sem ela. Mantenha o repositório **privado**: os seeds (`scripts/`) contêm todas as respostas.

Limite honesto: sem login, quem apagar o token pode recomeçar a rodada e quem script-ar 5 chamadas pode ler as respostas da edição antes de jogar. O desenho impede o acesso casual (rede, localStorage, código, imagens), não um trapaceiro determinado. Para isso seria preciso conta ou limite por IP.
