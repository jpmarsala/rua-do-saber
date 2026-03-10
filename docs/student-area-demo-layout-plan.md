# Área do Aluno — Plano de layout (demo fiel ao design)

## Estrutura comum: 3 colunas

- **Topo:** Título da aula (title-class-home / title-class-video / lesson-title).
- **Esquerda:** Logo, Configurações, Conquistas, caixa com robô/mensagem (speech-robot-home, speech-robot-video-screen, speech-robot-interactivity, speech-robot-mission).
- **Centro:** Conteúdo da tela (mapa, vídeo, grid de cartas, missão).
- **Direita:** Avatar, status, nível, XP, cards +1000/+500, Meus Cards, Próxima missão (closed-arch / open-arch).

## 1. Home
Rota: /aluno. Centro: map-background-home, title-class-home, button-level1..6-map-home, avatar-walking-map-home. Esquerda: speech-robot-home.

## 2. Vídeo
Rota: /aluno/aulas/[id]. Centro: title-class-video, player, controles (play, pause, stop, reverse, forward, sound, settings, full-screen). Esquerda: speech-robot-video-screen.

## 3. Jogo da memória
Rota: /aluno/jogos/[lessonId]. Centro: grid 3x4 com card-memory-robot e card-memory-1..8. Esquerda: speech-robot-interactivity.

## 4. Missão
Rota: /aluno/aulas/[id]/missao ou /aluno/missao. Centro: banner "Missão da Semana", texto, open-arch-mission-card. Esquerda: speech-robot-mission. Direita: teacher-message-mission.

## Implementação
- Layout compartilhado (AlunoDemoLayout) com slots para título, esquerda, centro, direita.
- SVGs em public/svg/ (cópia de src/ui/svg). Referência: src="/svg/nome.svg".

---

## Implementação feita

- **SVGs:** Cópia de `src/ui/svg/*.svg` para `public/svg/` (52 arquivos). Uso: `src="/svg/nome-do-arquivo.svg"`.
- **Layout compartilhado:** `components/aluno/AlunoDemoLayout.tsx` — 3 colunas (esquerda: logo, Configurações, Conquistas, slot do robô; centro: título + conteúdo; direita: avatar, status, nível, XP, cards, Meus Cards, Próxima missão, opcional Mensagem do Professor). Botões Configurações/Conquistas usam `settings-button.svg` e `achievment-button.svg`.
- **Telas demo:**
  - **Home:** `components/aluno/demo/AlunoDemoHome.tsx` — `title-class-home.svg`, `speech-robot-home.svg`, `map-background-home.svg`, `avatar-walking-map-home.svg`, `button-level1-map-home.svg`. Rota: `/aluno/demo`.
  - **Vídeo:** `AlunoDemoVideo.tsx` — `title-class-video.svg`, `speech-robot-video-screen.svg`, área de vídeo placeholder + barra de progresso + controles (play, pause, stop, etc.). Rota: `/aluno/demo/video`.
  - **Jogo da memória:** `AlunoDemoMemory.tsx` — `speech-robot-interactivity.svg`, grid 3×4 com `card-memory-robot.svg`. Rota: `/aluno/demo/jogo`.
  - **Missão:** `AlunoDemoMission.tsx` — `speech-robot-mission.svg`, texto da missão, `open-arch-mission-card.svg`, `showTeacherMessage` + `teacher-message-mission.svg`. Rota: `/aluno/demo/missao`.
- **Rotas:** `app/aluno/demo/page.tsx`, `app/aluno/demo/video/page.tsx`, `app/aluno/demo/jogo/page.tsx`, `app/aluno/demo/missao/page.tsx`. Todas exigem login (getSession + redirect).
- **Acesso:** Na página `/aluno` foi adicionado o link "Demo do design (Home / Vídeo / Jogo / Missão)" que leva a `/aluno/demo`. De lá é possível navegar para Vídeo → Jogo → Missão → Voltar ao início (links nos próprios componentes).
