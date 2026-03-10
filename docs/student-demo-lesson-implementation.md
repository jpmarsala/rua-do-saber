# Student Demo Lesson — Implementation Reference

## Assets (SVG)

Os assets oficiais do Rua do Saber estão em:

- **Logo:** `plataforma/public/assets/logoruadosaber.svg`  
  (origem: `Rua do Saber/Assets/SVG/SVG/logoruadosaber.svg`)
- **Mascote (robô):** `plataforma/public/assets/robot.svg`  
  (origem: `Rua do Saber/Assets/SVG/robot.svg`)

Uso no código:

- Sidebar: `<img src="/assets/logoruadosaber.svg" alt="Rua do Saber" />`
- Balão do mascote: `<img src="/assets/robot.svg" alt="" />` ao lado da mensagem

---

## Telas da Jornada do Aluno (referência visual)

1. **Bairro da Descoberta (mapa da jornada)**  
   Mapa com caminho e nós numerados; logo no sidebar; robô + mensagem no canto; perfil (avatar, nível, XP, “Meus Cards”, “Próxima missão”) à direita.  
   Componente: `StudentJourneyMockup` (rota `/aluno`).

2. **Vídeo da aula**  
   Título da aula no topo; player no centro; robô no sidebar com texto do tipo “Assista o vídeo até o fim…”; controles de vídeo no rodapé; painel direito igual ao mapa.  
   Fluxo: nó da jornada → `/aluno/aulas/[id]` (vídeo + conteúdo).

3. **Missão da Semana**  
   Título (ex.: “O meio ambiente e o trânsito”); faixa “Missão da Semana”; texto da missão e pergunta de reflexão; baú/tesouro; mesmo sidebar (logo, robô, notificação) e painel de perfil.  
   Pode ser uma seção dentro da aula ou tela dedicada quando a missão está liberada.

4. **Atividade interativa**  
   Grid de robôs (aulas/etapas) ou desafio (jogo, quiz); mesma identidade visual (logo, robô, perfil).  
   Fluxo: link “Jogar” em `/aluno/aulas/[id]` → `/aluno/jogos/[lessonId]`.

---

## Componentes e rotas

| Tela              | Componente / rota              | Assets usados                    |
|-------------------|--------------------------------|----------------------------------|
| Mapa da jornada   | `StudentJourneyMockup`, `/aluno` | logo, robot                      |
| Aula (vídeo + texto) | `AlunoAulaContent`, `/aluno/aulas/[id]` | (opcional: robot no sidebar) |
| Missão            | A definir (página ou seção)    | logo, robot                      |
| Jogo/atividade    | `/aluno/jogos/[lessonId]`      | logo, robot (se houver sidebar)  |

---

## Checklist de implementação demo

- [x] Logo SVG na sidebar da jornada
- [x] Robô SVG no balão do mascote no mapa
- [ ] Replicar sidebar (logo + robô) nas páginas de aula, missão e jogo
- [ ] Tela “Missão da Semana” com texto da missão e ilustração do baú
- [ ] Garantir que vídeo e atividade interativa usem a mesma paleta e componentes (header, sidebar, perfil)
