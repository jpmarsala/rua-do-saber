# Plano de implantação – Rua do Saber (documento v2)

Referência: **Rua_do_Saber_Fluxo_e_Gamificacao_v2.md**

Este plano organiza a implantação da versão v2 da plataforma em fases e tarefas, com dependências e prioridade.

---

## Visão geral das fases

| Fase | Nome | Objetivo principal | Duração estimada |
|------|------|--------------------|------------------|
| 1 | Dados e modelo | Turmas, alunos (username + nº chamada), estado da aula por turma, progresso aluno | 1–2 sprints |
| 2 | Cadeia de eventos (professor) | Dashboard do professor com controle da sequência e liberação para alunos | 1 sprint |
| 3 | Aluno e primeiro acesso | Lista de acessos, primeiro acesso (username/senha/avatar), aulas liberadas conforme turma | 1 sprint |
| 4 | Jornada da aula (aluno) | Fluxo mascote → vídeo → game → missão; balões de texto; XP/cards/níveis | 1–2 sprints |
| 5 | Gamificação e polish | Barra XP, níveis, cards, conquistas; mascote em todas as etapas | 0,5–1 sprint |

---

## Fase 1 – Dados e modelo

**Objetivo:** Ter no Supabase (ou equivalente) o modelo que suporta turmas, alunos com username/nº chamada, estado da aula por turma e progresso por aluno.  
**Doc:** §3 (usuários), §4–5 (contas e username), §14 (dashboard professor).

### 1.1 Modelo de dados

| Entidade / conceito | Descrição | Ação |
|--------------------|-----------|------|
| **Tenants** | Já existe (clientes). | Manter. |
| **Profiles** | Já existe (role: admin, gestor, professor, aluno). | Garantir vínculo a tenant e, se professor, a “escola/unidade”. |
| **Turmas** | Uma turma pertence a um tenant (ou escola); tem professor(es), nome, ano escolar. | Criar tabela `classes` ou `turmas`: tenant_id, name, school_year, created_at. |
| **Alunos na turma** | Inscrição aluno ↔ turma com número da chamada. | Criar tabela `class_students`: class_id, user_id (profile), call_number (número da chamada), created_at. |
| **Username do aluno** | Gerado: primeira_letra.ultimo_sobrenome; duplicidade = sufixo (k.lima2). | Campo em `profiles` (ex.: `username`) ou lógica na criação; garantir unicidade por tenant ou global. |
| **Estado da aula por turma** | Para cada turma + aula (lesson): introdução concluída? atividade concluída? | Criar tabela `class_lesson_state`: class_id, lesson_id, intro_completed_at (nullable), activity_completed_at (nullable), updated_at. Professor marca → preenche timestamps. |
| **Progresso do aluno por aula** | Por aluno + aula: vídeo visto, game concluído, missão validada. | Criar tabela `student_lesson_progress`: user_id, lesson_id, video_completed_at, game_completed_at, mission_validated_at (preenchido pelo professor), updated_at. |
| **Avatar** | Aluno escolhe avatar no primeiro acesso. | Campo em `profiles`: `avatar_id` (FK para tabela `avatars` com opções) ou `avatar_slug`. |
| **XP e nível** | Gamificação leve. | Opção A: campos em `profiles` (total_xp, level). Opção B: tabela `student_gamification` (user_id, total_xp, level, updated_at). |
| **Cards** | Cards conquistados (game + missão validada). | Tabela `student_cards`: user_id, lesson_id, card_type ('game' | 'mission'), unlocked_at. Ou um único card por aula com duas “fontes”. |

### 1.2 Regras de negócio (backend)

- **Geração de username:** função ou script: primeiro nome + último sobrenome → minúsculo, sem acentos → `username`; se já existe, `username + "." + (contador)` (ex.: k.lima2).
- **Lista de acessos:** consulta: por turma, listar alunos (call_number, full_name, username). Ordenar por call_number.
- **Liberação para aluno:** aluno vê aula X na turma dele apenas se existir `class_lesson_state` para (sua turma, aula X) com `intro_completed_at` preenchido. Missão da aula X só visível se `activity_completed_at` preenchido.

### 1.3 Entregas Fase 1

- [ ] Scripts SQL (Supabase): criar tabelas `turmas`/classes, `class_students`, `class_lesson_state`, `student_lesson_progress`, `avatars`, `student_cards` (ou equivalente), e campos em `profiles` (username, avatar_id).
- [ ] Migrations ou SQL versionado em `docs/` (ex.: SUPABASE_FASE6_TURMAS_E_PROGRESSO.sql).
- [ ] Documentação do modelo (ER ou lista de tabelas/campos) em `docs/`.

---

## Fase 2 – Cadeia de eventos (professor)

**Objetivo:** Professor com dashboard que controla a sequência da aula e libera conteúdo para os alunos.  
**Doc:** §2 (Introdução, Missão), §10–12, §14.

### 2.1 Dashboard do professor – visão por turma e aula

- Tela (ou seção): seleção de **turma** e **aula** (das 24 aulas).
- Para a aula selecionada, exibir:
  - **Botão “Introdução concluída”** → ao clicar, gravar `intro_completed_at` em `class_lesson_state` para (turma, aula). A partir daí os alunos dessa turma veem a aula (mascote + vídeo + game).
  - **Botão “Atividade concluída”** → ao clicar, gravar `activity_completed_at` em `class_lesson_state`. A partir daí os alunos veem a Missão.
- Contadores por etapa (somente leitura): “Introdução: N alunos” (total da turma), “Vídeo: N”, “Game: N”, “Missão: N” (baseado em `student_lesson_progress`).

### 2.2 Validação da missão por aluno

- Na mesma tela (ou em “Missões pendentes”): lista de alunos da turma com estado da **missão** daquela aula (não iniciada / realizada / validada).
- Ação: **“Missão validada”** por aluno → atualizar `student_lesson_progress.mission_validated_at` e conceder card adicional + XP (regras da Fase 4).

### 2.3 APIs / Server Actions

- `markIntroCompleted(classId, lessonId)` – service role.
- `markActivityCompleted(classId, lessonId)` – service role.
- `validateMission(userId, lessonId)` – service role; ao validar, atualizar progresso e gamificação (card + XP).

### 2.4 Entregas Fase 2

- [ ] Página (ou modal) “Aula ao vivo” / “Controle da aula”: turma + aula, botões Introdução concluída e Atividade concluída.
- [ ] Lista de alunos com checkbox ou botão “Missão validada” por aluno.
- [ ] Server Actions acima e persistência no Supabase.
- [ ] Testes: marcar introdução → aluno vê aula; marcar atividade → aluno vê missão; validar missão → card + XP.

---

## Fase 3 – Aluno e primeiro acesso

**Objetivo:** Lista de acessos para o professor; primeiro acesso do aluno (username + senha + avatar); aulas que o aluno vê dependem do estado da turma.  
**Doc:** §5–6, §14 (Lista de acessos).

### 3.1 Lista de acessos (professor)

- Nova tela (ou aba) no dashboard do professor: **“Lista de acessos”** por turma.
- Conteúdo: tabela **Nº da chamada | Nome | Usuário para login**.
- Opção: botão “Imprimir” ou “Exportar PDF” para distribuir na sala.

### 3.2 Primeiro acesso do aluno

- Login: **username** + **senha** (Supabase Auth: usuário já criado na importação; primeiro login pode exigir “definir senha” se não tiver).
- Após login, se `profiles.avatar_id` estiver vazio: redirecionar para **tela de escolha de avatar** (galeria de avatares). Ao escolher, salvar em `profiles` e redirecionar para home do aluno.
- Fluxo de convite/criação de conta do aluno: na importação da lista (Fase 1), criar usuário Supabase (email pode ser username@placeholder.tenant ou gerado) e profile com username e vínculo à turma; enviar instruções para primeiro acesso (ou professor entrega Lista de acessos).

### 3.3 Liberação de conteúdo para o aluno

- Na home e na listagem de aulas do aluno: **filtrar aulas** pelas quais a turma do aluno já passou (onde existe `class_lesson_state.intro_completed_at` para a turma dele).
- Dentro de uma aula: mostrar **Missão** só se `activity_completed_at` estiver preenchido para (turma, aula).
- Garantir que o aluno está associado a uma turma (e que a turma está associada a uma coleção/série de 24 aulas).

### 3.4 Importação de alunos e geração de username

- Tela “Importar lista de alunos” (professor): upload de CSV/Excel com colunas **número da chamada**, **nome completo**.
- Backend: para cada linha, gerar username (regra doc §5); em caso de duplicidade, sufixo numérico; criar usuário Supabase (se não existir) e profile; criar registro em `class_students` (class_id, user_id, call_number).
- Definir senha inicial: opção A – senha padrão temporária + “alterar no primeiro acesso”; opção B – link “definir senha” por e-mail (se houver e-mail único).

### 3.5 Entregas Fase 3

- [ ] Tela Lista de acessos (Nº | Nome | Usuário) por turma, com opção de imprimir/exportar.
- [ ] Fluxo primeiro acesso: login por username → se sem avatar, tela de escolha de avatar → salvar e ir para home.
- [ ] Lógica de “aulas liberadas” e “missão liberada” baseada em `class_lesson_state`.
- [ ] Importação de alunos com geração de username (e tratamento de duplicidade).
- [ ] Documentação para o professor: como imprimir lista e como os alunos fazem o primeiro acesso.

---

## Fase 4 – Jornada da aula (aluno)

**Objetivo:** Fluxo completo da aula para o aluno: mascote (balões) → vídeo → game → missão (quando liberada); registrar conclusões e recompensas.  
**Doc:** §9–12, §8 (mascote em balões).

### 4.1 Componente mascote e balões de texto

- Criar componente reutilizável **Mascote** com **balões de texto** (texto configurável por etapa/tela).
- Usar em: complemento da aula (etapa 1), antes do vídeo (etapa 2), preparação do desafio (etapa 3), sala de jogos (tutorial), liberação da missão (etapa 11).
- Estilo: simples e inclusivo (doc §8).

### 4.2 Fluxo da aula (páginas do aluno)

- **Etapa 1 – Complemento do mascote:** tela com mascote + balão com conceito principal; botão “Continuar”. Ao continuar, registrar (opcional) “etapa 1 vista” e dar pequena recompensa (XP inicial se definido).
- **Etapa 2 – Vídeo:** player do vídeo da aula; ao terminar (ou ao clicar “Concluí”), marcar `student_lesson_progress.video_completed_at` e mostrar feedback visual.
- **Etapa 3 – Preparação do desafio:** mascote em balão apresentando o desafio; botão “Jogar”.
- **Etapa 4 – Game:** redirecionar para o jogo da aula (já existente ou placeholder); ao atingir meta/barra XP, marcar `game_completed_at` e conceder XP + card (Fase 5).
- **Etapa 5 – Recompensa do game:** tela de celebração (XP ganho, card desbloqueado, nível se subiu).
- **Missão (quando liberada):** tela com mascote em balão explicando a missão; texto da missão; opção “Entendi, vou realizar” (não marca como validada – só o professor valida). Após o professor marcar “Missão validada”, o aluno vê card adicional + XP na próxima vez que acessar ou em notificação.

### 4.3 Persistência de progresso

- Ao concluir vídeo: UPDATE `student_lesson_progress` SET video_completed_at = now() WHERE user_id AND lesson_id.
- Ao concluir game: UPDATE game_completed_at; inserir card em `student_cards`; somar XP em profile (ou tabela de gamificação).
- Missão: apenas leitura pelo aluno; validação pelo professor (Fase 2) atualiza mission_validated_at e concede card + XP.

### 4.4 Entregas Fase 4

- [ ] Componente Mascote com balões de texto (props: texto, variante visual).
- [ ] Páginas/rotas da aula do aluno: complemento → vídeo → preparação → game → recompensa; tela de missão (quando liberada).
- [ ] Integração com jogos existentes (ou placeholder) e callback “game concluído”.
- [ ] Persistência de video_completed_at, game_completed_at; disparo de recompensas (XP, card) no backend.
- [ ] Exibir “Missão” apenas quando `activity_completed_at` estiver preenchido para a turma/aula.

---

## Fase 5 – Gamificação e polish

**Objetivo:** Barra de XP, níveis, cards digitais e conquistas por progresso; sem streaks nem rankings (doc §13).  
**Doc:** §13, §9 (recompensas).

### 5.1 XP e níveis

- Definir regras: ex. X pontos por vídeo concluído, Y por game concluído, Z por missão validada.
- Barra de XP na interface do aluno (ex.: header ou painel “Meu progresso”).
- Nível: função do total de XP (ex.: nível 1 = 0–100, nível 2 = 101–250, …). Exibir nível atual e progresso para o próximo.

### 5.2 Cards digitais

- Um card por aula (game) + um card adicional por missão validada (doc §12).
- Tela “Minha coleção” / “Cards conquistados”: grid de cards; desbloqueados com ilustração, bloqueados com placeholder ou cadeado.
- Ao desbloquear (game ou missão validada), animação curta (doc §9 etapa 5).

### 5.3 Conquistas (opcional)

- Conquistas por progresso: ex. “Primeira aula”, “5 aulas”, “Aula X concluída”. Tabela `achievements` e `student_achievements`; exibir em “Conquistas” ou no perfil.
- Manter leve: sem punições, sem rankings (doc §13).

### 5.4 Entregas Fase 5

- [ ] Cálculo e persistência de XP e nível; exibição da barra de XP e nível no perfil/home do aluno.
- [ ] Tela de coleção de cards; desbloqueio ao concluir game e ao ter missão validada.
- [ ] Animação de recompensa (card + XP) ao concluir game e ao receber validação da missão.
- [ ] (Opcional) Conquistas e tela “Minhas conquistas”.

---

## Dependências entre fases

```
Fase 1 (Dados) ──────────────────────────────────────────────────────────┐
     │                                                                     │
     ├──► Fase 2 (Professor: cadeia de eventos) ──► depende de class_lesson_state, class_students
     │                                                                     │
     ├──► Fase 3 (Aluno / primeiro acesso) ──► depende de turmas, alunos, username, avatar
     │                                                                     │
     └──► Fase 4 (Jornada da aula) ──► depende de student_lesson_progress, liberação por turma
              │
              └──► Fase 5 (Gamificação) ──► depende de XP, cards, níveis
```

- **Fase 1** deve ser concluída primeiro (modelo e migrations).
- **Fase 2** e **Fase 3** podem ser desenvolvidas em paralelo após Fase 1.
- **Fase 4** usa estado da turma (Fase 2) e identidade do aluno (Fase 3).
- **Fase 5** pode ser incremental (XP/cards básicos já na Fase 4; polish e conquistas na Fase 5).

---

## Checklist geral de implantação

- [ ] **Fase 1:** SQL e modelo documentado; migrations aplicadas no Supabase.
- [ ] **Fase 2:** Dashboard professor com “Introdução concluída” e “Atividade concluída”; validação de missão por aluno.
- [ ] **Fase 3:** Lista de acessos; primeiro acesso (username + senha + avatar); aulas e missão liberadas conforme turma.
- [ ] **Fase 4:** Mascote em balões; fluxo aluno (complemento → vídeo → game → recompensa → missão); persistência de progresso.
- [ ] **Fase 5:** XP, níveis, barra de progresso; cards e coleção; animações de recompensa.
- [ ] Testes E2E: professor marca introdução → aluno vê aula; professor marca atividade → aluno vê missão; professor valida missão → aluno recebe card + XP.
- [ ] Documentação de uso para professor e gestor (primeiro acesso dos alunos, uso do dashboard, lista de acessos).

---

*Plano alinhado ao documento Rua_do_Saber_Fluxo_e_Gamificacao_v2.md. Revisar com a equipe e ajustar prazos conforme capacidade.*
