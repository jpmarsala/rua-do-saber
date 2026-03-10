# Planejamento MVP — Plataforma de Educação no Trânsito (Etapas e Horas)

Estimativa em **horas** por etapa e tarefa. Total aproximado: **120–150 h** (3–4 semanas em regime full-time ou 6–8 semanas em part-time).

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| h | horas |
| (d) | depende da etapa anterior |
| [entrega] | artefato entregue |

---

## Resumo por etapa

| Etapa | Descrição | Horas min | Horas max |
|-------|-----------|-----------|-----------|
| 1 | Base do projeto | 8 | 12 |
| 2 | Conteúdo (Admin + páginas públicas) | 16 | 22 |
| 3 | Jogos (6 motores) | 32 | 42 |
| 4 | Login e ambientes por role | 14 | 20 |
| 5 | Professor + Aluno + Gestor | 20 | 28 |
| 6 | White-label | 8 | 12 |
| 7 | Conteúdo demo + ajustes finais | 12 | 18 |
| **Total** | | **110** | **154** |

---

## Etapa 1 — Base do projeto (8–12 h)

| # | Tarefa | h | Entregas |
|---|--------|---|----------|
| 1.1 | Criar projeto Next.js (App Router) + TypeScript + Tailwind | 1 | [ ] Repo inicial |
| 1.2 | Configurar Supabase: projeto, Auth, Postgres, Storage | 2 | [ ] Conta e keys |
| 1.3 | Integrar Supabase no app (client, env, tipos) | 1,5 | [ ] lib/supabaseClient, auth helpers |
| 1.4 | Estrutura de pastas: app/(public), app/t/[tenantSlug], app/aluno, app/professor, app/gestor, app/admin | 1 | [ ] Rotas base |
| 1.5 | Layout base + header (placeholder logo/tema) | 1,5 | [ ] Layout principal |
| 1.6 | Deploy Vercel + variáveis de ambiente | 1–2 | [ ] URL pública |
| 1.7 | Documentar setup (README: clone, env, run) | 0,5–1 | [ ] README |

**Subtotal Etapa 1:** 8–12 h

---

## Etapa 2 — Conteúdo (16–22 h)

| # | Tarefa | h | Entregas |
|---|--------|---|----------|
| 2.1 | Migrations SQL: tenants, collections, episodes, games, schools, classes, users, progress_events + enums (role, pillar, game type) | 3 | [ ] migrations/ |
| 2.2 | RLS: políticas por role (student, teacher, manager, admin) | 2 | [ ] RLS ativo |
| 2.3 | Seed mínimo: 1 tenant, 1 coleção, 2–3 episódios (sem jogos ainda) | 1 | [ ] seed.sql |
| 2.4 | Admin: CRUD coleções (listar, criar, editar) | 2 | [ ] /admin/colecoes |
| 2.5 | Admin: CRUD episódios (listar, criar, editar, campos do doc) | 3 | [ ] /admin/episodios |
| 2.6 | Página pública: listagem de coleções por tenant (/t/[tenantSlug]) | 1,5 | [ ] Biblioteca coleções |
| 2.7 | Página pública: listagem de episódios da coleção | 1 | [ ] Lista episódios |
| 2.8 | Página do episódio: título, resumo, vídeo YouTube (embed), botão “Jogar” (link placeholder), aba “Para o professor” (guia em MD + PDF opcional) | 2,5 | [ ] Página episódio |
| 2.9 | Componentes reutilizáveis: EpisodeCard, VideoPlayer, TeacherTab | 1–2 | [ ] components/ |

**Subtotal Etapa 2:** 16–22 h

---

## Etapa 3 — Jogos (32–42 h)

| # | Tarefa | h | Entregas |
|---|--------|---|----------|
| 3.1 | Modelo: games.type com decision \| match \| quiz \| memory \| garage \| novel; config_json; vincular jogo ao episódio | 0,5 | (já na migration 2.1) |
| 3.2 | Motor Decision (Sim/Não): componente, config_json, feedback, evento progress (game_start, game_complete) | 4 | [ ] DecisionGame |
| 3.3 | Motor Match (arraste e combine): componente, config_json, feedback, progress_events | 5 | [ ] MatchGame |
| 3.4 | Motor Quiz (5 perguntas): componente, config_json, pontuação, progress_events | 5 | [ ] QuizGame |
| 3.5 | Motor Memory (pares de cartas): componente, config_json (pares de imagens/textos), progress_events | 6 | [ ] MemoryGame |
| 3.6 | Motor Garage (cuidar de veículos, mecânica básica): fluxo de mini-tarefas, config_json, progress_events | 7–9 | [ ] GarageGame |
| 3.7 | Motor Novel (história com escolhas): cenas, opções, ramificações, config_json, progress_events | 5–7 | [ ] NovelGame |
| 3.8 | Página do jogo: /t/[tenantSlug]/jogos/[gameId] — carrega game por id, renderiza motor conforme type, envia eventos | 2 | [ ] Página jogo |
| 3.9 | Admin: CRUD jogos (tipo, episódio, config_json ou editor simples por tipo) | 3–4 | [ ] /admin/jogos |

**Subtotal Etapa 3:** 32–42 h

---

## Etapa 4 — Login e ambientes por role (14–20 h)

| # | Tarefa | h | Entregas |
|---|--------|---|----------|
| 4.1 | Tela de login (email/senha ou magic link) — Supabase Auth | 1,5 | [ ] /login |
| 4.2 | Tabela users (espelho): id, role, tenant_id, school_id, class_id; sync com Auth (trigger ou edge function) | 2 | [ ] users + sync |
| 4.3 | Middleware ou HOC: redirecionar não autenticado para /login; redirecionar por role após login (aluno→/aluno, professor→/professor, gestor→/gestor, admin→/admin) | 2,5 | [ ] Role-based redirect |
| 4.4 | Layouts por área: /aluno, /professor, /gestor, /admin (menu lateral ou tabs conforme role) | 2 | [ ] Layouts por role |
| 4.5 | RLS e queries: aluno só vê próprio progresso e conteúdos publicados do tenant; professor vê turmas da escola; gestor vê tenant; admin vê tudo | 2 | (revisão RLS) |
| 4.6 | Página “Meu perfil” ou dropdown (sair, trocar senha) | 1 | [ ] Logout / perfil |
| 4.7 | Testes de fluxo: login como aluno, professor, gestor, admin e redirecionamento correto | 1–2 | [ ] Fluxo validado |

**Subtotal Etapa 4:** 14–20 h

---

## Etapa 5 — Professor + Aluno + Gestor (20–28 h)

| # | Tarefa | h | Entregas |
|---|--------|---|----------|
| **Professor (visão da turma)** | | | |
| 5.1 | Listar turmas do professor (por school_id / vínculo user–turma) | 2 | [ ] Lista turmas |
| 5.2 | Página “Turma X”: alunos (opcional lista), episódios recomendados / calendário | 2,5 | [ ] Visão da turma |
| 5.3 | Botão “Marcar episódio como aplicado” (criar progress_event episode_applied por turma ou por turma+episódio); observação curta opcional | 2 | [ ] Marcar aplicado |
| 5.4 | Exibir resumo de engajamento da turma (quantos jogos concluídos, vídeos vistos — agregado por turma) | 2–3 | [ ] Engajamento turma |
| **Aluno (desenvolvimento + atividades)** | | | |
| 5.5 | Área do aluno: “Meu desenvolvimento” — progresso (vídeos assistidos, jogos concluídos, scores básicos) | 3 | [ ] /aluno — desenvolvimento |
| 5.6 | Área do aluno: “Atividades disponíveis” — episódios e jogos liberados para a turma do aluno (lista + links) | 2,5 | [ ] /aluno — atividades |
| 5.7 | Registrar video_view e game_start/game_complete com user_id (e class_id quando aplicável) | 1 | (já em progress_events) |
| **Gestor** | | | |
| 5.8 | Painel gestor: 4 KPIs (escolas ativas, turmas ativas, episódios aplicados 30 dias, jogos concluídos 30 dias) | 3 | [ ] KPIs |
| 5.9 | Tabelas: top escolas ativas, episódios mais aplicados, taxa conclusão jogos (últimos 30 dias) | 3–4 | [ ] Tabelas gestor |
| 5.10 | Filtros simples (tenant, período) e export CSV (opcional) | 1–2 | [ ] Filtros / export |

**Subtotal Etapa 5:** 20–28 h

---

## Etapa 6 — White-label (8–12 h)

| # | Tarefa | h | Entregas |
|---|--------|---|----------|
| 6.1 | theme_json em tenants (cores primária/secundária, fontes); aplicar no Tailwind via CSS variables | 2,5 | [ ] Tema dinâmico |
| 6.2 | Logo e mascote por tenant (logo_url, mascot_url no header e nas páginas principais) | 2 | [ ] Logo + mascote |
| 6.3 | Seletor “Município” (demo) no header para trocar tenant e recarregar tema | 1,5 | [ ] Seletor tenant |
| 6.4 | Admin: tela de configuração de marca (upload logo/mascote, cores) | 2–3 | [ ] /admin/marca |
| 6.5 | Garantir que jogos e landing usem cores/mascote do tenant | 1–2 | [ ] Consistência visual |

**Subtotal Etapa 6:** 8–12 h

---

## Etapa 7 — Conteúdo demo + ajustes finais (12–18 h)

| # | Tarefa | h | Entregas |
|---|--------|---|----------|
| 7.1 | Seed completo: 2 tenants (AGETRAN Campo Grande, Município Demo), 1 coleção, 6 episódios, 6 jogos (pelo menos 1 de cada tipo: decision, match, quiz, memory, garage, novel) | 4–5 | [ ] Seed demo |
| 7.2 | Conteúdo real: textos dos episódios, config_json dos 6 jogos, imagens/links | 3–4 | [ ] Conteúdo utilizável |
| 7.3 | Contas demo: 1 aluno, 1 professor, 1 gestor (documentar logins no README ou PDF) | 0,5 | [ ] Credenciais demo |
| 7.4 | Responsividade (mobile): navegação, cards, jogos, painéis | 2–3 | [ ] Mobile ok |
| 7.5 | Checklist final (URL, tenants, episódios, jogos, logins, professor aplicado, aluno desenvolvimento, gestor KPIs) | 1 | [ ] Checklist §13 doc |
| 7.6 | Ajustes de UX e bugs | 2–3 | [ ] Estável para feira |

**Subtotal Etapa 7:** 12–18 h

---

## Cronograma sugerido (semanas)

Assumindo **~25–30 h/semana** de dev:

| Semana | Etapas | Foco |
|--------|--------|------|
| 1 | 1 + 2 | Base + conteúdo (Admin + páginas públicas + episódio com vídeo) |
| 2 | 3 (parte 1) | Jogos: Decision, Match, Quiz + página do jogo + Admin jogos |
| 3 | 3 (parte 2) + 4 | Jogos: Memory, Garage, Novel + Login e redirecionamento por role |
| 4 | 5 | Professor (visão da turma), Aluno (desenvolvimento + atividades), Gestor (KPIs e tabelas) |
| 5 | 6 + 7 | White-label + conteúdo demo + responsividade + checklist e ajustes |

Em **part-time (12–15 h/semana)**: estender para **6–8 semanas**.

---

## Dependências entre etapas

```
Etapa 1 (Base)
    → Etapa 2 (Conteúdo) → Etapa 3 (Jogos)
    → Etapa 4 (Login)
            → Etapa 5 (Professor + Aluno + Gestor)
    → Etapa 6 (White-label) — pode ser em paralelo a 5
    → Etapa 7 (Demo + ajustes) — após 3, 4, 5, 6
```

---

## Riscos e buffers

- **Garage e Novel** são os jogos mais complexos; reserve buffer (+2–4 h cada) se surgirem mudanças de design.
- **RLS e perfis**: garantir class_id do aluno e vínculo professor–turma desde o seed para evitar retrabalho.
- **Mobile**: testar jogos (arraste, toques) cedo para não deixar para o fim.

---

## Controle de horas (template)

Use esta tabela para marcar o que foi feito e as horas reais:

| Etapa | Previsto (h) | Real (h) | Status |
|-------|----------------|----------|--------|
| 1 | 8–12 | | ⬜ |
| 2 | 16–22 | | ⬜ |
| 3 | 32–42 | | ⬜ |
| 4 | 14–20 | | ⬜ |
| 5 | 20–28 | | ⬜ |
| 6 | 8–12 | | ⬜ |
| 7 | 12–18 | | ⬜ |
| **Total** | **110–154** | | |

---

*Documento alinhado ao `plataforma_educacao_no_transito_documento_de_desenvolvimento_mvp_para_a_feira.md` (jogos: decision, match, quiz, memory, garage, novel; login por role; área do professor com visão da turma; área do aluno com desenvolvimento e atividades disponíveis).*
