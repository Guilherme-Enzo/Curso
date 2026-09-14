# Auto Elétrica — ANOTACOES DO APP

> Visão completa do projeto: infra, código, rotas, deploy, marca e decisões de design.

---

## Marca
- Nome correto: **Auto Elétrica** (duas palavras, com acento)
- Tagline: "Elétrica & Injeção Eletrônica Automotiva"
- Palette: tema azul elétrico fixo (fundos azulados #020617/#082f49, superfícies zinc mapeadas para azuis, acentos ciano/azul #06b6d4/#2563eb, gradientes) — **sem seletor de tema** (aplicado no `<html data-theme="blue">`)

---

## Infraestrutura
- IP público: `13.68.155.190`
- Porta pública: **80** (app Next escuta direto, precisa `sudo` para porta <1024)
- SSH: Guilherme (G maiúsculo) via `/root/.local/bin/vps` (sshpass)
- UFW: 22/80/443 apenas
- Azure NSG: 22/80/443 abertas
- EasyPanel/n8n: **REMOVIDOS** (2026-09-11 — foco só no app)

---

## Stack do App
| Item | Versão |
|---|---|
| Next.js | 16.3.4 (App Router, TypeScript) |
| Tailwind CSS | v4 |
| Prisma | 6.19.3 |
| @prisma/client | 6.19.3 |
| Node.js | v22.23.2 (NodeSource) |
| npm | 10.9.8 |
| PostgreSQL | 16 (local, porta 5432) |

---

## Banco de Dados
- Banco: `autoeletrica`
- Usuário: `autoeletrica` / Senha: `ae_master_2026`
- DATABASE_URL: `postgresql://autoeletrica:ae_master_2026@localhost:5432/autoeletrica?schema=public`

### Tabelas
| Tabela | Campos principais |
|---|---|
| User | id (uuid), name, email (único), passwordHash, role (student/teacher/admin), createdAt |
| Module | id (uuid), order (Int, 1–10), name, description?, content? (JSON submodules), pdfUrl?, quiz? (1:1, onDelete: Cascade), aiMessages[], quizAttempts[], studyTimes[], createdAt |
| Question | id, userId→User, questionText, answerText?, status (open/answered), createdAt |
| Quiz | id, moduleId→Module (único, onDelete: Cascade), title, source ("seed" do livro / "ia" do Gemini), questions[], createdAt |
| Question | id, userId→User, questionText, answerText?, status (open/answered), createdAt |
| Quiz | id, moduleId, title, questions[], createdAt |
| QuizQuestion | id, quizId→Quiz, order, question, correctIndex, options[] |
| QuizOption | id, questionId→QuizQuestion, order, text |
| AiMessage | id, userId→User, moduleId→Module (onDelete: Cascade), role (user/assistant), content, createdAt — histórico do chat "Perguntar à IA" por (aluno, módulo) |
| QuizAttempt | id, userId→User, quizId→Quiz, moduleId→Module (ambos onDelete: Cascade), details (JSON com snapshot da avaliação: título + cada pergunta/opções/correta/escolhida), correct, total, createdAt — **1 tentativa salva a cada correção** (média e histórico vêm daqui) |
| StudyTime | id, userId→User, moduleId→Module (onDelete: Cascade), seconds acumulados, updatedAt; unique(userId, moduleId) — **horas de estudo** somadas via heartbeat enquanto o aluno lê a aba Conteúdo |
| Topic | id, title, description, authorId→User (onDelete: Cascade), createdAt — **tópico da Comunidade** (histórico permanente; apaga só teacher/admin) |
| TopicMessage | id, topicId→Topic (onDelete: Cascade), authorId→User (onDelete: Cascade), content, createdAt, updatedAt — **comentário** na caixa de diálogo do tópico; editar/apagar só o autor |
| TopicRead | id, userId→User (onDelete: Cascade), topicId→Topic (onDelete: Cascade), readAt (DateTime) — **registro de leitura** por (usuário, tópico); unique(userId, topicId); atualizado com upsert quando o usuário abre um tópico |

---

## Estrutura de Arquivos
```
~/AutoEletrica/
├── prisma/
│   ├── schema.prisma      # Module (order/name/description/pdfUrl) — Material removido
│   └── prisma.config.ts
├── lib/
│   ├── auth.ts          # JWT helpers (signToken, verifyToken)
│   ├── prisma.ts        # Prisma client singleton
│   ├── session.ts       # getApiUser() — sessão p/ rotas de API
│   ├── modules.ts       # MODULES (10 módulos do livro + submódulos c/ conteúdo e imagens) + moduleTitle()
│   ├── upload.ts        # savePdf/removeFile + resolveFile (PDF em public/uploads/materiais)
│   ├── quizAI.ts        # Quiz com Gemini: pdf-parse (extrai texto do PDF) + @google/genai (10 perguntas JSON) + validação
│   └── aiChat.ts        # Chat com IA por módulo: getModuleContent (extrai/cacheia o texto do PDF) + streamChatAnswer (Gemini streaming)
├── middleware.ts         # Protege /dashboard,/aluno,/professor,/admin → redirect /login
├── .env                 # DATABASE_URL + JWT_SECRET
├── seed.js              # Wipe + usuários de teste + 10 módulos (do modseeds) + 10 quizzes "seed" (10 perguntas cada)
├── public/uploads/materiais/  # 10 PDFs por módulo (mod-m01..m10.pdf) + uploads uuid.pdf; servidos via /arquivos/materiais/*
├── public/uploads/modulos/      # Figuras do livro por módulo (m1..m10, nome p<page>_<hash>) — telas via / Conteúdo
└── app/
    ├── layout.tsx        # Root layout (Geist fonts, title Auto Elétrica)
    ├── globals.css       # Tailwind v4 (base padrão 16px)
    ├── page.tsx          # LANDING PAGE (hero, módulos, diferenciais, footer)
    ├── login/page.tsx
    ├── register/page.tsx
    ├── dashboard/page.tsx   # Hub: redireciona por papel (admin→/admin, teacher→/professor, student→/aluno)
    ├── aluno/page.tsx       # Painel Aluno: tabs Conteúdo (módulos via /api/modules/public) | Módulos e PDFs (cards módulo + PDF) | Dúvidas | Avaliações | Desempenho
    ├── perfil/page.tsx      # Perfil: alterar nome e senha (todos os papéis; header tem "← Voltar ao painel")
    ├── professor/page.tsx   # Painel Professor: tabs Módulos (CRUD + PDF) | Dúvidas (responder)
    ├── admin/page.tsx       # Painel Admin: Dashboard | Módulos | Dúvidas | Cadastro de Professores
    ├── components/
    │   ├── ModulesManager.tsx  # CRUD de módulos: criar, editar nome/descrição, trocar PDF, excluir (professor + admin)
    │   ├── QuestionsManager.tsx  # Responder dúvidas (professor + admin), agrupadas por aluno, badges vermelho/verde
    │   ├── AiChatModal.tsx       # Janela do "Perguntar à IA" por módulo (histórico + streaming)
    │   ├── CommunityTopicDialog.tsx  # Diálogo de tópico da comunidade (mensagens, 3-dot menu, delete com ConfirmModal)
    │   ├── ConfirmModal.tsx      # Modal de confirmação reutilizável (tema danger/warning)
    │   ├── ErrorModal.tsx        # Modal de erro (vermelho, auto-close 2s, "Tente novamente mais tarde")
    │   └── types.ts
    ├── arquivos/materiais/[file]/route.ts  # Serve PDFs de public/uploads/materiais
    └── api/
        ├── auth/login|register|logout|session/route.ts
        ├── auth/me/route.ts            # GET dados do usuário | PATCH atualizar nome e/ou senha (exige senha atual; bcrypt; validações de tamanho)
        ├── ai/messages/route.ts        # GET histórico do chat IA (param moduleId, do próprio usuário)
        ├── ai/ask/route.ts             # POST pergunta à IA do módulo → resposta em streaming (SSE)
        ├── ai/suggestions/route.ts     # GET 3 perguntas sugeridas personalizadas do módulo (Gemini, não-streaming)
        ├── modules/route.ts            # GET lista (inclui resumo do quiz) | POST criar (staff; multipart name, description?, file? → gera quiz IA)
        ├── modules/[id]/route.ts       # PATCH editar/trocar PDF (regenera quiz IA se trocou PDF) | DELETE excluir (staff; deleta quiz+aiMessages+quizAttempts+studyTimes, renumera)
        ├── modules/[id]/quiz/route.ts  # POST regenerar quiz do módulo com IA (staff)
        ├── modules/public/route.ts     # GET módulos para aluno (merge DB + array estático: icon, tag, summary, submodules)
        ├── questions/route.ts          # GET lista | POST criar (student)
        ├── questions/[id]/route.ts     # POST responder (staff)
        ├── quizzes/route.ts            # GET lista quizzes (filtro moduleId)
        ├── quizzes/[id]/route.ts       # GET quiz completo | POST correção (salva QuizAttempt com snapshot)
        ├── study/heartbeat/route.ts    # POST acumular tempo de estudo por módulo
        ├── performance/route.ts        # GET resumo de desempenho do aluno (tentativas, média, horas)
        ├── admin/stats/route.ts        # GET métricas (admin)
        ├── admin/teachers/route.ts     # GET listar | POST criar professor (admin)
        └── admin/teachers/[id]/route.ts# DELETE professor (admin)
```

---

## Rotas da Aplicação
| Rota | Método | Descrição |
|---|---|---|
| `/` | GET | Landing Page (hero, módulos, CTA) |
| `/login` | GET | Formulário de login |
| `/register` | GET | Formulário de cadastro (nome, email, senha) — sempre aluno |
| `/dashboard` | GET | Hub por papel: admin→`/admin`, teacher→`/professor`, student→`/aluno` |
| `/aluno` | GET | Painel do aluno (protegido, só student) |
| `/professor` | GET | Painel do professor (protegido, só teacher) |
| `/admin` | GET | Painel do admin (protegido, só admin): dashboard + curso + professores |
| `/perfil` | GET | Perfil (protegido): alterar nome e senha — botão "Perfil" no header de aluno/professor/admin, antes de "Sair" |
| `/comunidade` | GET | **Comunidade (protegida, qualquer papel logado)**: fórum com memória permanente — lista tópicos (título, descrição, nome do criador, data); botão "＋ Criar novo tópico" abre formulário (título + descrição, ambos obrigatórios); clicar num tópico abre a **caixa de diálogo de conversa**; link "Comunidade" no header de aluno/professor/admin |
| `/arquivos/materiais/[file]` | GET | Serve PDF (lê do public/uploads/materiais) |
| `/api/auth/register` | POST | Cadastro público — **sempre cria aluno** (professores só via admin) |
| `/api/auth/login` | POST | Login (bcrypt + JWT cookie 7d) |
| `/api/auth/logout` | POST | Logout (limpa cookie) |
| `/api/auth/session` | GET | Retorna sessão atual via cookie |
| `/api/auth/me` | GET/PATCH | Dados do usuário / atualizar **nome** e/ou **senha** (senha nova exige a atual; troca de senha = bcrypt recomputado, login não é revogado) |
| `/api/modules` | GET/POST | Listar módulos + resumo do quiz (logado) / Criar (staff; multipart: name, description?, file? — se enviar PDF, gera quiz IA automático; order = max+1) |
| `/api/modules/[id]` | PATCH/DELETE | Editar nome/descrição/trocar PDF (staff, multipart; trocar PDF regenera quiz) / Excluir módulo (staff, deleta quiz+aiMessages+quizAttempts+studyTimes, auto-renumeração em transação) |
| `/api/modules/public` | GET | Listar módulos para o aluno (merge DB + array estático): retorna id, order, name, description, pdfUrl, hasQuiz, icon, tag, summary, submodules (do `lib/modules.ts`) |
| `/api/modules/[id]/quiz` | POST | Regenerar quiz do módulo com IA (staff; necessita pdfUrl + GEMINI_API_KEY) |
| `/api/questions` | GET/POST | **Staff (admin E professor) vê TODAS as dúvidas**; aluno só as próprias / criar dúvida (questionText) |
| `/api/questions/[id]` | POST | Responder (staff, answerText → status answered) |
| `/api/ai/messages` | GET | Histórico do chat IA do usuário logado (param `moduleId`) |
| `/api/ai/ask` | POST | Perguntar à IA sobre o módulo (`{moduleId, question}`) → resposta **em streaming** (SSE `data: {text}` … `data: {done}`); salva pergunta e resposta em AiMessage |
| `/api/ai/suggestions` | GET | 3 perguntas sugeridas **personalizadas do módulo** (Gemini lê o conteúdo do PDF) — regeneradas a cada abertura do chat |
| `/api/quizzes` | GET | Lista quizzes (param moduleId opcional) |
| `/api/quizzes/[id]` | GET/POST | Quiz completo (perguntas+opções) / autocorreção (answers[]) → {total, correct, results}; **cada submissão salva um `QuizAttempt`** (snapshot completo da avaliação) |
| `/api/study/heartbeat` | POST | Acumula tempo de estudo: `{moduleId, seconds}` (upsert em `StudyTime`, max 600s; guarda anti-duplo de 30s — contagens rápidas demais retornam `counted:0`) |
| `/api/topics` | GET/POST | **Comunidade:** listar tópicos (inclui autor via relation + `unreadCount` server-side via TopicRead; qualquer logado) / criar `{title, description}` (qualquer logado; ambos obrigatórios) |
| `/api/topics/[id]` | GET/DELETE | Ver tópico + mensagens (authorName incluído) — **upsert em TopicRead ao abrir** (marca como lido) / **excluir tópico (somente staff** — aluno recebe 403) |
| `/api/topics/[id]/messages` | POST | Criar comentário `{content}` no tópico (qualquer logado) |
| `/api/topics/[id]/messages/[messageId]` | PATCH/DELETE | **Editar/excluir comentário — somente o próprio autor** (aluno não consegue editar/apagar de outro: 403) |
| `/api/performance` | GET | Desempenho do aluno autenticado: tentativas (com snapshot + %), e summary (média, nº tentativas, horas de estudo somadas, módulos com tentativa e aprovados) |
| `/api/admin/stats` | GET | Métricas gerais (admin) |
| `/api/admin/teachers` | GET/POST | Listar / cadastrar professor (admin) |
| `/api/admin/teachers/[id]` | DELETE | Excluir professor (admin) |

---

## Autenticação
- Senhas: bcryptjs (hash + compare)
- JWT: jsonwebtoken, cookie httpOnly 7 dias
- JWT_SECRET no `.env`
- Cookie `token`: httpOnly, sameSite lax, **secure dinâmico** (true se HTTPS, false se HTTP)
- Middleware protege `/dashboard`, `/aluno`, `/professor`, `/admin`, `/perfil`, `/comunidade` → redirect `/login?next=...`
- Painéis também checam role no cliente (admin↔professor↔aluno)
- **Roles:** `student` (cadastro público), `teacher` (criado pelo admin), `admin` (seed)
- **Middleware roda com `runtime: "nodejs"`** (edge não lia JWT_SECRET → 307 loop)
- **Login/Register redirecionam se já logado:** `/login` e `/register` verificam `GET /api/auth/session` antes de renderizar o formulário; se tiver sessão válida, redireciona pro painel do papel (admin→/admin, teacher→/professor, student→/aluno)

---

## Landing Page (Design)
- Paleta: zinc-950 base, amber/laranja acentos, gradientes industriais
- Efeitos: glassmorphism, backdrop-blur, grid sutil de fundo (blueprint), glow shadows
- Sections:
  1. **Navbar** sticky (glass): logo + links + CTA Cadastre-se
  2. **Hero**: badge "Diagnóstico na prática", título grande, subtítulo com copy de oficina, 2 CTAs
  3. **Módulos**: grid de 10 cards baseados no livro "Injeção Eletrônica — Os Fundamentos" (Introdução, Ignição, Combustível, Alimentação Elétrica, Sensores, Atuadores, Drive By Wire, Conversor Catalítico, Estratégias, Sistema de Alimentação)
  4. **Diferenciais**: PDFs, Canal de Dúvidas, Avaliações por módulo
  5. **IA no estudo** (`id="ia"`): título "A IA está dentro do teu aprendizado" + 3 cards (quizzes gerados pela IA, perguntas que pegam, sempre em dia) — também no menu (link "IA") e no rodapé
  6. **CTA Final**: gradiente escuro + 2 botões
  7. **Footer**: identidade + links rápidos + créditos
- Responsiva: mobile-first (tablets/celulares de oficina)
- Botões CTA → `/login` e `/register`

---

## Módulos e Conteúdo (Livro "Injeção Eletrônica — Os Fundamentos")
- Fonte: HTML do livro "Injeção Eletrônica — Os Fundamentos" (Keven Madalozzo) — PDF usado apenas como referência para montar o conteúdo (NÃO é publicado no site)
- **10 módulos = 10 capítulos técnicos do livro** (Ch1 Introdução e Ch12 Considerações Finais ficam de fora)
- Cada módulo tem **submódulos** (subseções do capítulo) com teoria resumida + figuras do livro
- Conteúdo 100% em `lib/modules.ts` (estático, served via `/api/modules/public`); imagens em `public/uploads/modulos/m{1..10}/`
- Campo `content` (JSON) no DB para futuros módulos dinâmicos (atualmente vazio para os 10 existentes)
- **Estrutura por módulo:**
  1. Introdução à Injeção Eletrônica (Ch2, 9 subs) — Triplo C, estequiometria, ECU, mono/multiponto, modos de injeção, direta/indireta, sensores/atuadores, auto adaptação/scanner
  2. Sistema de Ignição (Ch3, 8 subs) — introdução, bobina, cabo, vela, driver, tipos de bobina, gráfico no osciloscópio, falhas
  3. Combustível (Ch4, 5 subs) — octanagem, gasolina (aditivada/adulterada), etanol, relação AF, fator lambda
  4. Alimentação Elétrica (Ch5, 2 subs) — aterramento (linha 31), queda de tensão
  5. Sensores (Ch6, 10 subs) — ECT, IAT, TPS, MAP, CKP, CMP, KS, sonda lambda, VSS, MAF
  6. Atuadores (Ch7, 6 subs) — bomba, eletroinjetor, marcha lenta (solenoide/motor de passo), canister, EGR
  7. Drive By Wire (Ch8, 5 subs) — TBI, sensor e sinal, atuador e chaveamento, limpeza e aprendizado, pedal
  8. Conversor Catalítico (Ch9, 2 subs) — função, eficiência (sonda pós-catalisador)
  9. Estratégias de Injeção (Ch10, 8 subs) — adaptativos, marcha lenta, cut-off, abertura de AF, open/closed loop, dashpot, luz de anomalia, modo alternativo
  10. Sistema de Alimentação (Ch11, 8 subs) — bomba, regulador, bico, vazão, estanqueidade, limpeza, filtro, rampa
- **Avaliações:** 1 quiz por módulo (10 perguntas), flutuante (acompanha o ciclo do módulo). Seed cria 10 quizzes "seed" (do livro, shuffle determinístico). Ao **guardar/trocar o PDF** de um módulo, o quiz é **regenerado automaticamente com IA (10 perguntas, marcado "IA")**, substituindo o anterior daquele módulo (delete + create em transação, source "seed"→"ia")
- **Desempenho (aba do aluno):** cada correção vira um `QuizAttempt` (snapshot). A aba mostra cards (média %, avaliações feitas, **horas de estudo**, módulos concluídos) + tentativas agrupadas por módulo (nota e média do módulo), e ao **clicar numa tentativa** abre o resumo ao vivo da avaliação (gabarito com ✓/✗). **Horas de estudo:** a aba Conteúdo envia heartbeat a cada 60s (enquanto visível e com módulo aberto) para `POST /api/study/heartbeat` → acumuladas em `StudyTime` por (aluno, módulo); representam tempo lendo o conteúdo
- **Quiz com IA (Gemini):** `lib/quizAI.ts` — extrai texto do PDF com `pdf-parse@1.1.1` via `require("pdf-parse/lib/pdf-parse.js")` (v1 não usa worker; o `index.js` do v1 quebra no build por ler arquivo de teste; **v2 não usar** — worker `pdf.worker` quebra no bundle Turbopack), envia ao `@google/genai` (modelo default `gemini-3.6-flash`, config `GEMINI_MODEL`, texto cortado em 60k chars) com prompt pedindo EXATAMENTE 10 perguntas de múltipla escolha (4 alternativas, JSON sem markdown); parse robusto (tira ```json, valida 4 options, correctIndex 0–3). Sem `GEMINI_API_KEY` no `.env` o upload **não falha** — responde `aiError` e a UI avisa. Botão "🤖 Gerar quiz com IA" no professor (POST `/api/modules/[id]/quiz`, espera o **module id**, não o quiz id) para regenerar sob demanda; erro da IA tratado (extrai `error.message`, ex: modelo descontinuado/rate limit). Falha da IA preserva o quiz antigo do módulo
- **PDFs por módulo:** 1 PDF por módulo (10 ao todo, pdfkit: capa + sumário de submódulos + teoria + figuras) em `public/uploads/materiais/mod-m01..m10.pdf`, registrados no seed como Module (order = 1–10, name, description = nomes dos submódulos do capítulo, pdfUrl = `/arquivos/materiais/mod-m<mm>.pdf`). Professor/admin gerenciam via ModulesManager (criar módulo, editar nome/descrição, trocar PDF, excluir); uploads novos seguem o padrão uuid.pdf
- Schema: **Module substitui Material** — para aplicar na VPS: `npx prisma db push --accept-data-loss` (derruba a tabela antiga de materials)
- Geração dos PDFs (regenerar se o conteúdo mudar): compilar `lib/modules.ts` com o TS do projeto e rodar script `gen_pdfs.js` (repo: `/tmp/pdfgen/` na VPS)
- Nota: figuras mapeadas por página do capítulo (heurística) — sem conferência visual automática
- **Numeração dos módulos é dinâmica:** o `order` no banco define a ordem exibida (admin/professor badge `{order}`, aluno "Módulo N", avaliações "Módulo {moduleOrder}"); excluir um módulo **renumera os seguintes** (`order > deleted` decrementa em transação). Títulos de quiz **não gravam número** (seed = "Avaliação — X", IA = "Avaliação IA — X") — o número exibido vem do `order` atual, então nunca "envelhece"
- Login/cadastro: branding "Auto Elétrica" e o subtítulo ("Acesse sua conta" / "Crie sua conta para começar") **centralizados** na caixa
- Publicar módulo com PDF: botão vira "Salvando e gerando quiz com IA..." enquanto gera; ao concluir a lista recarrega e o status aparece (IA ok / erro e o quiz antigo é preservado)

## Perguntar à IA (tutor do módulo)
**Botão** no card do módulo: **"💬 Estude com a IA sobre este módulo"** abre a janela com header "Estude com a IA"; texto de apresentação do professor virtual sem citar correções ("Estude com a IA e aproveite ao máximo este módulo: faça perguntas, tire dúvidas, peça explicações e exemplos de oficina...")
- **Onde:** painel do aluno → ABA MÓDULOS → cada card de módulo tem o botão **"💬 Estude com a IA sobre este módulo"** (logo abaixo de Visualizar/Baixar) que abre uma **janela de diálogo (modal)** com o chat do módulo
- **Contexto:** a IA responde **só com base no conteúdo do PDF do módulo** (extraído e cacheado via `lib/aiChat.ts` em `public/uploads/ia/<nome-do-pdf>.txt` — key = nome do arquivo UUID, então trocar o PDF invalida sozinho; texto cortado em 80k chars). Se o aluno perguntar **fora do escopo, corrige educadamente e traz a conversa de volta** ao tema do módulo (validado: pergunta sobre corrente elétrica no Módulo 1 → redirecionou pro Triplo C)
- **Fluxo:** `POST /api/ai/ask` salva a pergunta → monta prompt professor + conteúdo + **histórico (últimas 10 mensagens)** → `generateContentStream` no Gemini (modelo `GEMINI_MODEL`, default `gemini-3.6-flash`) → resposta **streaming via SSE** (`data: {"text":...}` + `data: {"done":true}`), salva resposta em `AiMessage`. Erros vêm como `data: {"error":...}` e a UI mostra no balão
- **UI (`AiChatModal.tsx`):** balões de chat (aluno amarelo à direita, IA cinza à esquerda), renderização de markdown: títulos ##, listas `-`/`*` e numeradas, **negrito**/`*itálico*`/`` código ``, e **tabelas |** em grid próprio (sem escapar da caixa — células quebram texto, largura controlada); `break-words` + `min-w-0` (quebras só quando preciso, sem cortar palavra ao meio de forma estranha); indicador de "digitando" (3 bolinhas); rolagem automática; fecha com Esc/✕. Histórico recarregado ao abrir (`GET /api/ai/messages?moduleId=`)
- **Fórmulas com KaTeX (`$...$` / `$$...$$`):** renderer do chat agora interpreta LaTeX — inline `$...$` e em bloco `$$...$$` (ex.: `$E_c=\frac{1}{2}mv^2$`, `$$V_{max}=\sqrt{2}\cdot V_{rms}$$`) via `katex` (renderToString, `throwOnError:false`, importa `katex.min.css`); blocos ``` dentro de `<pre>` (diagramas ASCII ficam alinhados, sem ser confundidos com tabela); linha `---` vira `<hr>`. **Bug antigo corrigido:** regex `\*\*[^*]+\*\*` engolia a fórmula quando o modelo escrevia `**$...$**` (negrito envolvendo LaTeX), deixando `$...$` literal dentro do `<strong>` — aparecia "cor mais forte/letra maior" e fórmula crua. **Solução:** matemática é extraída ANTES do negrito/itálico com placeholders `UE000K#UE000` (`inlineNodes` → `nodesWithMath`); bold/italic processam texto mascarado, e os placeholders são restaurados como `<span>` com KaTeX. Regex inline atual: `$$…$$` > `$…$` extraída primeiro, depois `**bold**`, `*italic*`, ``code``; `nodesWithMath` percorre placeholders e injeta math como nós React. Dep: `katex@^0.18.7` + `@types/katex@^0.16.8` (client-side, rodar `npm install` na VPS). CSS: `.modal-chat .katex{font-size:1em}` para matemática acompanhar tamanho do texto. Validado com a resposta real de física quântica do módulo "Teste" (testemunha de emaranhamento, colapso EPR) — todas as fórmulas + o padrão `**$+\frac{\hbar}{2}$**` agora renderizam
- **Sugestões do professor virtual:** NÃO são fixas — `GET /api/ai/suggestions?moduleId=` gera **3 perguntas de estudo específicas do módulo** (baseadas no PDF: estequiometria/etanol no M1, corpo de borboleta/pedal no M6...) e **variam a cada abertura** (novo módulo → sugestões próprias do conteúdo dele). Mostradas no painel "Professor virtual do módulo" e como chips nos primeiros turnos
- **Ajuste de prompt:** toda resposta termina com uma pergunta curta do professor ("entendeu tudo? quer uma dica sobre algum tópico do módulo?")
- **Respostas flexíveis:** a IA usa o conteúdo do módulo como fonte principal, mas **responde temas relacionados** (ex.: módulo de velas → aluno pergunta sobre a bobina; perguntas sobre multímetro/osciloscópio/scanner) ligando ao que o módulo ensina. Só redireciona ao módulo se o assunto for totalmente fora do automotivo
- **Erros da IA tratados:** o `ApiError` do SDK vem aninhado (`err.message = {"error":{"message":"<JSON>"}}`) — `geminiErrorMessage` desembrulha o campo message em loop até texto legível; cotas (429/RESOURCE_EXHAUSTED) mostram "Limite de requisições da IA atingido. Aguarde alguns minutos e tente novamente." (mesmo fix aplicado no quizIA)
- **⚠️ Cota do Gemini:** a chave é free tier com **~20 requisições/dia por modelo** (além de 20/min) — nossos testes de hoje esgotaram o limite diário. Para uso real com turma, recomendar chave paga
- **🛡️ Reserva OpenRouter (fallback automático):** se o Gemini falhar (cota 429/erro), **quiz, chat e sugestões caem sozinhos** para o OpenRouter. `lib/openrouter.ts` — cliente OpenAI-compatível contra `https://openrouter.ai/api/v1/chat/completions` (não-stream `openRouterComplete`+`openRouterStream`, SSE corta SÓ deltas de `content`, ignora `reasoning`); percorre a lista de modelos em ordem (config `OPENROUTER_MODELS`, default `nvidia/nemotron-3-ultra-550b-a55b:free` → `nvidia/nemotron-3-super-120b-a12b:free` → `google/gemma-4-31b-it:free` → `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` → `openrouter/free`) e valida: content não vazio + JSON parseável (se não, tenta o próximo). `.env`: `OPENROUTER_API_KEY` (**na VPS, nunca no repo**) e `OPENROUTER_MODELS` opcional. Método de troca: `askQuiz()` no quizAI e fallback dentro de `streamChatAnswer`/`askForSuggestions` no aiChat (Gemini primário → reserva). Modelos `:free` do OpenRouter = **50 req/dia por conta** (falhas contam); com US$10 na conta → 1.000/dia. `parseQuestions` ficou robusto a modelo de raciocínio (percorre posições de `[` até achar array que parseie — reserve respondeu CLEAN depois do reasoning). **Validado em produção:** GEMINI_MODEL forçado inválido → quiz regenerou 10 perguntas (source "ia") e chat streamou resposta pelo fallback; revertido o teste em seguida
- **Schema:** tabela `AiMessage` (userId + moduleId, onDelete: Cascade no Module) — aplicada com `npx prisma db push` + `npx prisma generate`
- **Validado em produção:** pergunta off-topic redirecionada ao tema; pergunta on-topic (Triplo C / atuadores) respondida corretamente do conteúdo; historico salvo por (aluno, módulo)

---

## Escala Mobile (globals.css)
- **Base padrão 16px** (sem override de `html`) — tamanhos padrão do Tailwind
- Usuário pediu redução após a primeira versão aumentar fontes; tema azul elétrico fixo no `<html>` (data-theme="blue", data-grid="16"); área de mudança de tema removida (admin → Tema, /api/theme, ThemeLoader)
- Painéis com tabs grandes que rolam horizontalmente no celular (overflow-x-auto)

---

## Deploy
- Build: `npm run build` (produção, no VPS)
- **SEVIÇO:** systemd `autoeletrica.service` → `sudo systemctl restart autoeletrica`
- Start manual (fallback): `cd ~/AutoEletrica && sudo env PORT=80 npm run start`
- Logs: `journalctl -u autoeletrica -f` ou `/tmp/app.log`
- Staging local (Android): `/tmp/opencode/aeweb/` — edits feitos aqui, scp pro VPS
- **Upload de PDF:** salvo em `public/uploads/materiais/` (fora do build — serve por `/arquivos/materiais/[file]` em runtime, nada de cache do `next start`); **limite de 100MB por arquivo** (`lib/upload.ts` → `savePdf` valida `file.size > 100 * 1024 * 1024`; extensão só `.pdf`). Antes era 20MB
- **💬 Comunidade (`/comunidade`, link no header de aluno/professor/admin):** fórum com memória permanente (banco). **Lista de tópicos** mostra título, descrição e nome do criador (e data); botão "＋ Criar novo tópico" abre formulário (título + descrição, obrigatórios) — qualquer logado cria. **Caixa de diálogo** (modal estilo AiChatModal) por tópico: comentários com nome do autor e hora, input para comentar; **cada usuário pode editar e excluir os próprios comentários** (botões aparecem só nos dele; API valida `authorId === user.id`, senão 403). **Excluir tópico = só teacher/admin** (aluno nem vê o botão; API 403). Feedback no padrão do painel: painel âmbar "Criando tópico, aguarde..."/"Enviando comentário, aguarde..."/"Salvando comentário, aguarde..."/"Excluindo…" com spinner, botão "Salvando...", e depois verde "Tópico criado com sucesso!"/"Comentário editado com sucesso!"/"Comentário excluído." — a lista/diálogo é atualizado na hora (fetch) sem recarregar a página; no tópico com comentário editado, aparece "(editado)". **3 pontinhos (⋮)** no canto da data do comentário (só nos próprios), dropdown com Editar/Excluir; fecha ao clicar fora. **Badge de não-lidas** server-side: tabela `TopicRead` registra `readAt` por (usuário, tópico); badge âmbar mostra mensagens com `createdAt > readAt`; sem registro = todas como não-lidas; ao abrir tópico, `upsert` marca como lido. **Sair vermelho** no diálogo (border-red-700 text-red-400). Permissões testadas em produção: 17/17. Deploy exige `npx prisma db push` (tabelas Topic + TopicMessage + TopicRead) + `npx prisma generate` + restart
- **Dependências IA:** `npm install @google/genai` + `npm install pdf-parse@1.1.1` + `npm install --save-dev @types/pdf-parse`; `GEMINI_API_KEY` já configurada no `.env` da VPS (modelo opcional `GEMINI_MODEL`, default `gemini-3.6-flash` — `gemini-2.0-flash` retorna 404 "no longer available"); **reserva OpenRouter:** `OPENROUTER_API_KEY` (setada na VPS) + `OPENROUTER_MODELS` opcional (lista de modelos, vírgula) — sem nenhuma chave o app continua funcionando, só sem IA

---

## Comandos Úteis
```bash
# Build na VPS
cd ~/AutoEletrica && npm run build

# Serviço (recomendado — porta 80, sobe sozinho)
sudo systemctl restart autoeletrica
sudo systemctl status autoeletrica
sudo journalctl -u autoeletrica -f

# Seed (recria usuários de teste + quizzes)
cd ~/AutoEletrica && node seed.js

# Ver logs antigos
tail -f /tmp/app.log

# Verificar quem está na porta 80
sudo ss -tlnp | grep ":80 "

# Prisma
npx prisma validate
npx prisma db push
npx prisma generate
```

### Usuários de Teste
| Papel | Email | Senha |
|---|---|---|
| Aluno | `aluno.teste@auto.com` | `aluno123` |
| Professor | `professor.teste@auto.com` | `prof123` |
| Admin | `admin@auto.com` | `13421342` |

---

---

## Padrão de Feedback de Ações (UI)
Toda ação de **salvar/atualizar/excluir** usa o mesmo padrão da publicação de módulo:
1. **Painel âmbar enquanto processa** (spinner animado + "Salvando [X], aguarde..." + subtítulo explicando o que está acontecendo); campos e botão desabilitados
2. **Área atualizada automaticamente** ao terminar (processa a lista localmente)
3. **Mensagem de sucesso** em painel verde (ou vermelho em erro) no topo da seção

Onde está aplicado: criar/editar módulo e gerar quiz (painel amarelo + verde), **excluir módulo** (painel vermelho "Excluindo o módulo..." + botão com spinner), **responder dúvida** no professor/admin (painel por card + "Dúvida respondida com sucesso!"), **enviar dúvida** no aluno (painel "Enviando sua dúvida, aguarde..." + "Dúvida enviada com sucesso!" + histórico recarregado), **cadastrar/excluir professor** no admin (painel amarelo/vermelho), **perfil** (painel "Salvando seu nome"/"Alterando sua senha, aguarde..." + card de nome atualizado em tela) e **corrigir avaliação** (painel "Corrigindo avaliação, aguarde..."). Erros sempre acompanham a mesma estética (painel vermelho).

---

## Próximos Passos
- ✔ Quiz IA validado em produção: módulo 3 (Combustível) regenerado com IA (source "ia", 10 perguntas, correção OK); demais módulos seguem com quiz seed até serem regenerados
- ✔ **Perguntar à IA** validado em produção (chat por módulo, histórico salvo, streaming, redireciona pergunta fora do módulo)
- ✔ **Desempenho do aluno** validado em produção (tentativas salvas + média + horas de estudo + resumo clicável); tentativas de teste: 2 (20% no Módulo 1)
- Testes finais móvel (aluno/professor no celular — usuário vai validar na VPS)
- Profissional: ver tentativas/desempenho dos **alunos** no painel do professor (próxima frente; banco já guarda `QuizAttempt`)
- Deploy estável (possível containerização futura)
- HTTPS (domínio + Let's Encrypt) para cookie secure completo
