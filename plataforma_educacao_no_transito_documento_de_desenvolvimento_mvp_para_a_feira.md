# Plataforma Municipal de Educação no Trânsito (MVP)

Documento de desenvolvimento para colocar a plataforma no ar rapidamente com Cursor (vibe coding), com foco em demonstrar: **vídeos + jogos + área do professor + painel do gestor**.

---

## 1) Objetivo do MVP

**Meta do MVP para a feira**
- Demonstrar um produto replicável e escalável (white-label municipal) com:
  - Biblioteca de episódios (vídeos)
  - Jogos interativos ligados a cada episódio
  - Área do professor (atividade/guia de aula)
  - Painel do gestor (engajamento e uso)

**O que o MVP NÃO precisa**
- Não precisa de gamificação complexa (ranking, loja, etc.)
- Não precisa de editor de conteúdo avançado
- Não precisa de “IA adaptativa” ou relatórios sofisticados

**Critério de sucesso na feira**
- Um decisor consegue navegar em 2 minutos e entender:
  1) O programa anual (24 episódios)
  2) O reforço por jogos
  3) Como a escola aplica
  4) Como a agência acompanha

---

## 2) Público e perfis de usuário

### 2.1 Perfis
1. **Aluno** (criança)
   - **Login do aluno:** acessa com sua conta e vê **seu desenvolvimento** (progresso, jogos concluídos, vídeos assistidos) e **atividades disponíveis** (episódios e jogos liberados pela turma/escola).
   - Acessa jogos e vídeos
   - Faz missões simples

2. **Professor**
   - **Login do professor:** acessa com sua conta e tem a **visão da turma** (turmas sob sua responsabilidade, episódios aplicados, engajamento da turma).
   - Acessa roteiro/guia do episódio
   - Aplica atividades
   - Registra conclusão

3. **Gestor (Agência / Secretaria)**
   - Vê painel geral
   - Escolas ativas
   - Episódios aplicados
   - Jogos concluídos

4. **Admin (sua equipe)**
   - Cadastra coleções
   - Sobe vídeos
   - Cria atividades
   - Publica jogos
   - Personaliza marca do município

---

## 3) Escopo do MVP (funcionalidades)

### 3.1 Conteúdo
- **Coleção Anual** (ex.: 2026)
- **24 episódios**
- Cada episódio tem:
  - título, resumo, pilar, faixa etária, duração
  - vídeo (embed)
  - 1 jogo associado (mínimo)
  - guia do professor (texto + PDF opcional)
  - atividade prática (checklist)

### 3.2 Jogos do MVP (6 tipos)
> Implementar **6 “motores” de jogos** e reaproveitar com conteúdo diferente.

1) **Decisão rápida (Sim/Não)**
- Cena + pergunta + 2 botões
- Feedback imediato

2) **Arraste e combine (matching)**
- Arrastar item para alvo correto
- Feedback por tentativa

3) **Quiz de 5 perguntas**
- Múltipla escolha
- Pontuação simples

4) **Jogo de memória**
- Cartas viradas: encontrar pares (sinais, placas, comportamentos no trânsito).
- Configurável: número de pares, imagens por episódio.

5) **Garagem**
- Cuidar de veículos e aprender **mecânica básica** (óleo, pneu, faróis, documentação).
- Mini-tarefas: verificar nível, trocar pneu, conferir luzes; conteúdo educativo em cada ação.

6) **Novel interativo**
- História com escolhas (cliques em opções); desfechos ligados a segurança no trânsito.
- config_json: cenas, textos, opções, ramificações e feedback por escolha.

### 3.3 Ambientes de login (por role)
- **Login do professor** → redireciona para **área do professor** com **visão da turma**: turmas sob sua responsabilidade, episódios recomendados, marcar como aplicado, ver engajamento da turma.
- **Login do aluno** → redireciona para **área do aluno**: **seu desenvolvimento** (progresso, jogos e vídeos concluídos) e **atividades disponíveis** (episódios e jogos liberados para a turma).
- **Login do gestor** → painel do gestor (KPIs, escolas, episódios aplicados, jogos concluídos).
- **Login do admin** → painel admin (CRUD, marca, conteúdo).

### 3.4 Navegação / telas (MVP)
- Landing institucional (o que é + como funciona)
- Biblioteca (coleções → episódios)
- Página do episódio (vídeo + botão “jogar” + guia do professor)
- Página do jogo (rodar no navegador)
- **Área do professor** (após login)
  - Visão da turma: turmas, episódios recomendados / calendário
  - Marcar como “aplicado”
- **Área do aluno** (após login)
  - Meu desenvolvimento (progresso, conquistas básicas)
  - Atividades disponíveis (episódios e jogos da turma)
- Painel do gestor
  - números-chave
  - escolas/turmas ativas
  - episódios aplicados
  - jogos concluídos
- Admin
  - CRUD de coleções/episódios
  - upload de assets
  - configuração de marca (logo, cores, mascote)

---

## 4) Branding e White-label (essencial para o discurso)

### 4.1 Tema por município (Tenant)
- Nome do programa
- Logo
- Paleta (2–3 cores)
- Mascote (imagem principal)
- Vinheta/imagens de capa

### 4.2 Como o MVP mostra isso
- Um seletor “Município” no canto (apenas para demo)
- Troca instantânea:
  - topo com logo
  - cores do UI
  - mascote nas páginas e jogos

---

## 5) Arquitetura recomendada (rápida de colocar no ar)

### 5.1 Stack (pragmático)
- **Next.js (App Router) + TypeScript**
- **TailwindCSS**
- **Supabase** (Auth + Postgres + Storage)
- **Vercel** (deploy)
- **Plausible ou PostHog** (analytics simples) — opcional

### 5.2 Por quê
- Login pronto (Supabase Auth)
- Banco + regras de acesso (Row Level Security)
- Storage para imagens/mascotes/PDFs
- Deploy rápido

---

## 6) Modelo de dados (Postgres)

### 6.1 Tabelas principais
- **tenants** (municípios)
  - id, name, slug
  - theme_json (cores, fontes)
  - logo_url, mascot_url

- **collections**
  - id, tenant_id (ou global)
  - title, year, description

- **episodes**
  - id, collection_id
  - title, summary
  - pillar (enum)
  - grade_min, grade_max
  - video_url (YouTube)
  - teacher_guide_md
  - worksheet_pdf_url (opcional)
  - published_at

- **games**
  - id, episode_id
  - type (decision | match | quiz | memory | garage | novel)
  - config_json (conteúdo do jogo)

- **schools**
  - id, tenant_id
  - name

- **classes**
  - id, school_id
  - name, grade

- **users** (espelho do auth)
  - id, role (student | teacher | manager | admin)
  - tenant_id
  - school_id (opcional)
  - class_id (opcional; para aluno: turma vinculada)

- **progress_events**
  - id, tenant_id, user_id
  - event_type (video_view | game_start | game_complete | episode_applied)
  - episode_id, game_id
  - score (opcional)
  - metadata_json
  - created_at

### 6.2 Regras (RLS)
- Teacher vê apenas turmas da própria escola
- Manager vê tudo do tenant
- Admin vê todos
- Student vê apenas conteúdos publicados e seu progresso

---

## 7) UI/UX (objetivo e institucional)

### 7.1 Componentes essenciais
- Header com logo do tenant + seletor (demo)
- Cards de episódio (pilar, faixa etária, duração)
- Player de vídeo
- Botão grande “Jogar agora”
- Aba “Para o professor” (guia + baixar PDF)
- Painel do gestor com 4 KPIs:
  - escolas ativas
  - turmas ativas
  - episódios aplicados (30 dias)
  - jogos concluídos (30 dias)

### 7.2 Linguagem
- Curta, clara, sem infantilizar demais a interface do gestor
- Área do aluno mais visual e simples

---

## 8) Conteúdo inicial para demo (seed)

Para a feira, preparar:
- 1 tenant “AGETRAN Campo Grande”
- 1 tenant “Município Demo”

Coleção demo:
- 6 episódios publicados (em vez de 24) já basta para demonstrar o sistema.
- 6 jogos (2 de cada tipo) para mostrar variedade.

---

## 9) Plano de implementação (ordem recomendada)

### Etapa 1 — Base do projeto
- Setup Next.js + Tailwind
- Supabase (Auth + DB + Storage)
- Deploy Vercel

### Etapa 2 — Conteúdo
- CRUD mínimo no Admin (coleção/episódio)
- Página pública da coleção e do episódio
- Vídeo embed + guia do professor

### Etapa 3 — Jogos
- Implementar motores:
  - decision, match, quiz
  - memory (jogo de memória)
  - garage (cuidar de veículos, mecânica básica)
  - novel (novel interativo com escolhas)
- Persistir progress_events

### Etapa 4 — Login e perfis (ambientes por role)
- Login (Supabase Auth)
- Role-based routing e redirecionamento:
  - Professor → área do professor (visão da turma)
  - Aluno → área do aluno (seu desenvolvimento + atividades disponíveis)
  - Gestor → painel do gestor
  - Admin → painel admin

### Etapa 5 — Professor + Aluno + Gestor
- Professor: visão da turma, lista de turmas, marcar episódio como aplicado
- Aluno: área “Meu desenvolvimento” + “Atividades disponíveis” (episódios/jogos da turma)
- Gestor: KPIs + tabelas simples

### Etapa 6 — White-label
- Theme por tenant
- Troca de branding (demo)

---

## 10) Prompts prontos para o Cursor (vibe coding)

> Use como comandos diretos. Ajuste o nome do seu repositório e stack.

### 10.1 Prompt — arquitetura inicial
“Crie um app Next.js (App Router) com TypeScript + Tailwind. Integre Supabase (Auth, Postgres, Storage). Estruture rotas: / (landing), /t/[tenantSlug], /t/[tenantSlug]/colecoes/[collectionId], /t/[tenantSlug]/episodios/[episodeId], /t/[tenantSlug]/jogos/[gameId], /aluno (área do aluno: desenvolvimento + atividades), /professor (visão da turma), /gestor, /admin. Login por role: professor → /professor, aluno → /aluno, gestor → /gestor, admin → /admin. Layout com header que muda conforme o tenant.”

### 10.2 Prompt — schema + RLS
“Crie migrations SQL para as tabelas: tenants, collections, episodes, games, schools, classes, users, progress_events. Adicione enums para role e pillar. Configure RLS: student lê apenas episódios publicados do tenant; teacher lê turmas da school; manager lê tudo do tenant; admin lê tudo.”

### 10.3 Prompt — motores de jogo
“Implemente seis componentes de jogo em React: DecisionGame, MatchGame, QuizGame, MemoryGame (pares de cartas), GarageGame (cuidar de veículos, mecânica básica), NovelGame (história com escolhas). Cada um recebe config_json do Supabase e registra eventos em progress_events (game_start, game_complete) com score e metadata.”

### 10.4 Prompt — painel do gestor
“Crie /gestor com KPIs calculados do progress_events (últimos 30 dias) e tabelas: top escolas ativas, episódios mais aplicados, taxa de conclusão de jogos. UI simples e institucional.”

### 10.5 Prompt — área do professor
“Crie /professor com lista de turmas, calendário de episódios recomendados e botão para marcar episódio como aplicado (criar progress_event episode_applied). Permitir anexar observação curta.”

### 10.6 Prompt — white-label
“Implemente tema por tenant usando theme_json (cores). Trocar logo e mascote por tenant. Aplicar tema no Tailwind via CSS variables.”

---

## 11) Estrutura sugerida do repositório
- /app
  - /(public)
  - /t/[tenantSlug]/...
  - /aluno (área do aluno: desenvolvimento + atividades disponíveis)
  - /professor (visão da turma)
  - /gestor
  - /admin
- /components
  - EpisodeCard
  - VideoPlayer
  - TeacherTab
  - KPI
  - games/
    - DecisionGame
    - MatchGame
    - QuizGame
    - MemoryGame
    - GarageGame
    - NovelGame
- /lib
  - supabaseClient
  - auth
  - rls-helpers
- /db
  - migrations
  - seed

---

## 12) Segurança e privacidade (mínimo viável)
- Conteúdo infantil: evitar coleta de dados pessoais desnecessários.
- Para demo: usar contas genéricas.
- Em produção: autenticação por escola, com consentimentos e política de privacidade.

---

## 13) Checklist final (antes da feira)
- [ ] URL pública funcionando
- [ ] 2 tenants com troca visível de marca
- [ ] 1 coleção com 6 episódios publicados
- [ ] Jogos funcionais: decision, match, quiz, memory, garage, novel (pelo menos 1 de cada tipo para demo)
- [ ] Login por role: aluno → área do aluno (desenvolvimento + atividades); professor → visão da turma; gestor → painel
- [ ] Professor consegue marcar “aplicado” e ver visão da turma
- [ ] Aluno vê seu desenvolvimento e atividades disponíveis
- [ ] Gestor vê KPIs e tabelas
- [ ] Conteúdo e navegação funcionam em celular

---

## 14) Entregáveis para o estande (além do site)
- 1 QR Code para acesso
- 1 login demo por perfil
- 1 PDF institucional de 1 página (resumo do programa)
- 1 slide com a arquitetura (vídeo → jogo → atividade → relatório)

---

## 15) Decisões de produto

- **Vídeos:** YouTube (embed; não hospedar arquivos no app).
- **Acesso do aluno:** **Com login.** O aluno entra com sua conta e vê:
  - **Seu desenvolvimento:** progresso, jogos e vídeos concluídos.
  - **Atividades disponíveis:** episódios e jogos liberados para sua turma.
- **Acesso do professor:** **Com login.** O professor entra e tem a **visão da turma** (turmas sob sua responsabilidade, marcar aplicado, engajamento).
- **Ambientes por role:** redirecionamento após login conforme perfil (aluno → /aluno, professor → /professor, gestor → /gestor, admin → /admin).

