# Modelo de dados – Fase 6 (v2 – Fase 1)

Referência: **SUPABASE_FASE6_V2_DADOS_E_MODELO.sql** e **PLANO_IMPLANTACAO_V2.md**.

---

## Tabelas novas (Fase 6)

| Tabela | Descrição |
|--------|-----------|
| **avatars** | Opções de avatar para o aluno (primeiro acesso). Campos: id, slug, name, image_url, sort_order. |
| **class_lesson_state** | Estado da aula por turma: intro_completed_at, activity_completed_at. Professor marca no dashboard → libera aula e missão para os alunos. |
| **student_lesson_progress** | Progresso do aluno por aula: video_completed_at, game_completed_at, mission_validated_at (preenchido pelo professor). |
| **student_cards** | Cards desbloqueados: user_id, lesson_id, source ('game' \| 'mission'), unlocked_at. Um card por game concluído; um por missão validada. |

---

## Alterações em tabelas existentes

| Tabela | Alteração |
|--------|-----------|
| **profiles** | + username (text, único, para login do aluno); + avatar_id (FK avatars); + total_xp (int, default 0); + level (int, default 1). |
| **student_classes** | + call_number (int, nullable). Número da chamada na turma; UNIQUE(class_id, call_number) quando não nulo. |

---

## Relacionamentos (resumo)

- **profiles** → avatars (avatar_id)
- **class_lesson_state** → classes, lessons
- **student_lesson_progress** → auth.users (user_id), lessons
- **student_cards** → auth.users (user_id), lessons

Fluxo:
- **Turma** (classes) tem **alunos** (student_classes: student_id, class_id, call_number).
- **Professor** controla a aula por turma em **class_lesson_state** (intro_completed_at, activity_completed_at).
- **Aluno** tem progresso por aula em **student_lesson_progress** (vídeo, game, missão validada).
- **Aluno** acumula **student_cards** (game + mission) e XP/nível em **profiles**.

---

## Regras de negócio (aplicação)

1. **Username:** gerado na importação de alunos: primeira letra do primeiro nome + "." + último sobrenome (minúsculo, sem acentos). Duplicidade: sufixo numérico (k.lima2, k.lima3). Unicidade global em profiles.username.
2. **Lista de acessos:** por turma, consultar student_classes + profiles (call_number, full_name, username), ordenado por call_number.
3. **Aula liberada para aluno:** existe class_lesson_state para (turma do aluno, lesson_id) com intro_completed_at preenchido.
4. **Missão liberada para aluno:** mesmo row com activity_completed_at preenchido.
5. **Card + XP ao concluir game:** aplicação insere em student_cards (source='game') e atualiza student_lesson_progress.game_completed_at e profiles.total_xp (e level se necessário); usar service role para inserir em student_cards se RLS não permitir.
6. **Card + XP ao validar missão:** professor marca "Missão validada" → aplicação (service role) atualiza student_lesson_progress.mission_validated_at, insere student_cards (source='mission'), soma XP em profiles.

---

## Ordem de execução

Executar **SUPABASE_FASE6_V2_DADOS_E_MODELO.sql** no Supabase SQL Editor após as Fases 1 a 5 (tenants, profiles, schools, classes, teacher_classes, student_classes, lessons, lesson_views, game_sessions já existirem).
