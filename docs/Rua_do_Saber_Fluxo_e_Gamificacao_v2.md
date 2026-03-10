# Rua do Saber
## Documento de Fluxo da Plataforma e Gamificação (v2)

**Guia funcional para desenvolvimento da plataforma**  
*Versão revisada com definições de controle do professor, primeiro acesso, mascote e validação da missão.*

---

## 1. Visão do produto

O **Rua do Saber** é uma plataforma educacional que organiza a educação no trânsito para alunos do ensino fundamental em um sistema contínuo de aprendizagem.

Cada conteúdo é apresentado como uma **Aula-Kit**, composta por uma sequência pedagógica fixa que combina mediação do professor, conteúdo audiovisual, interação digital e aplicação prática.

O sistema integra:
- ambiente digital para alunos
- ferramentas pedagógicas para professores
- acompanhamento institucional para gestores
- gamificação leve para motivação e progresso

O objetivo é apoiar o aprendizado de forma estruturada e significativa, sem criar dependência digital ou pressão de uso.

---

## 2. Estrutura pedagógica da aula

Todas as aulas seguem a mesma sequência pedagógica. Essa sequência **não deve ser alterada pela plataforma ou pela gamificação**.

**Sequência fixa:**  
Introdução (professor) → Vídeo-tema → Game-desafio → Missão (aplicação no mundo real)

Cada etapa tem um papel pedagógico específico.

### Introdução

Realizada pelo professor em sala.

Objetivos:
- ativar conhecimento prévio
- contextualizar o tema
- iniciar discussão

O professor trabalha com o **dashboard aberto**. Após realizar a introdução em sala, ele marca no dashboard **"Introdução concluída"**. A partir desse momento, a plataforma **libera aquela aula** para os alunos da turma (complemento do mascote, vídeo e game). O professor tem o **controle da sequência** da aula; a plataforma responde a ele numa **cadeia de eventos**.

### Vídeo-tema

Conteúdo audiovisual curto (30–60 segundos).

Função:
- apresentar o conceito central da aula
- ilustrar uma situação cotidiana
- preparar o aluno para o desafio

O vídeo é sempre seguido por feedback visual simples.

### Game-desafio

Momento principal de interação digital. O game deve reforçar o tema da aula através de atividades como:
- quiz
- classificação
- memória
- simulação de decisão
- puzzle

O aluno pode repetir o jogo até atingir o objetivo da aula. O progresso é representado por uma barra de XP. Quando a meta é alcançada, a etapa é concluída.

### Missão

A missão conecta o aprendizado digital com o mundo real. Exemplos:
- observar elementos da rua
- conversar com a família
- realizar uma atividade prática

A missão é **liberada pela plataforma** somente após o professor marcar no dashboard **"Atividade concluída"** (ou seja, após a atividade presencial — debate, dramatização, desenho, atividade corporal). O mascote explica a tarefa ao aluno em **balões de texto**. A missão deve ser realizada fora da plataforma.

Na **aula seguinte**, o professor avalia a missão (presencialmente ou por evidência) e, no dashboard, marca **"Missão validada"** para cada aluno que a realizou. Após a validação, a plataforma concede ao aluno: card adicional, XP e atualização de nível. Isso fecha o ciclo pedagógico da aula.

---

## 3. Estrutura do sistema de usuários

O sistema possui diferentes tipos de usuários.

### Administrador

Usuário responsável pela gestão da plataforma.

Funções:
- cadastrar clientes
- configurar ambientes institucionais
- publicar conteúdos
- gerenciar acessos
- supervisionar o sistema

### Cliente (gestor institucional)

Representa a instituição que utiliza o programa. Exemplos: prefeitura, secretaria de educação, órgão de trânsito, escola.

O cliente tem acesso ao painel institucional e pode cadastrar professores.

### Professor

Responsável pela aplicação pedagógica das aulas.

Funções:
- criar turmas
- importar listas de alunos
- conduzir as aulas
- **controlar a sequência da aula no dashboard** (Introdução concluída → libera aula; Atividade concluída → libera Missão)
- liberar missões (via marcação "Atividade concluída")
- validar missões na aula seguinte ("Missão validada")
- registrar progresso da turma

### Aluno

Participa da jornada de aprendizagem.

Funções:
- assistir vídeos
- jogar desafios
- completar missões
- colecionar cards
- acompanhar progresso

### Suporte

Equipe responsável pelo atendimento e suporte técnico.

---

## 4. Fluxo de criação de contas

A criação de usuários segue uma hierarquia.

### 1. Cadastro do cliente

O administrador cria o cadastro institucional (ex.: Escola Municipal de Campo Grande). Esse cadastro define:
- identidade visual
- gestores responsáveis
- permissões institucionais

### 2. Cadastro de professores

O cliente envia ou cadastra uma lista de professores. Dados necessários:
- nome
- e-mail
- escola ou unidade

Cada professor recebe um convite para ativação da conta.

### 3. Ativação da conta do professor

O professor:
- confirma o e-mail
- cria senha
- acessa sua área

### 4. Criação de turmas

O professor cadastra suas turmas. Dados da turma:
- nome da turma
- ano escolar
- lista de alunos

### 5. Importação da lista de alunos

O professor pode enviar um arquivo com:
- número da chamada
- nome completo do aluno

A plataforma cria automaticamente os usuários dos alunos.

---

## 5. Geração automática de usuários de alunos

Para cada aluno o sistema gera: **username** (para login) e **número da chamada** (identificador na turma).

### Regra de username

**Formato:** primeira letra do primeiro nome + "." + último sobrenome  

**Exemplo:** Karla da Silva Lima → k.lima

**Regras:**
- sempre minúsculo
- ignorar acentos
- não diferenciar maiúsculas e minúsculas

**Duplicidade:** em caso de dois ou mais alunos gerando o mesmo username (ex.: dois k.lima), o sistema gera variações com **sufixo numérico**: k.lima2, k.lima3, etc.

### Número da chamada (ID na turma)

O número da chamada identifica o aluno **naquela turma** (ex.: 1 a 40). Ele é usado para:
- **primeiro acesso:** o aluno (ou o professor) localiza na **Lista de acessos** da turma qual é o username correspondente (evitando confusão com nomes compostos ou longos)
- relatórios e listagens da turma

Após o primeiro acesso, o aluno utiliza **apenas username e senha** para entrar na plataforma. O número da chamada passa a ser dispensável para login; a padronização do username existe para **simplificar o primeiro acesso**.

### Lista de acessos (para o professor)

A plataforma deve oferecer, por turma, uma **Lista de acessos** (impressa ou na tela) com:
- **Nº da chamada** | **Nome** | **Usuário para login**

Assim, no primeiro acesso, o aluno identifica seu usuário pelo número da chamada ou pelo nome, sem ambiguidade.

---

## 6. Primeiro acesso do aluno

No primeiro acesso o aluno:
1. entra com **username** (localizado na Lista de acessos da turma)
2. cria **senha**
3. escolhe seu **avatar**

Esse momento marca o início da jornada na plataforma.

---

## 7. Avatar do aluno

O aluno escolhe um avatar inicial.

Função do avatar:
- representar o aluno na plataforma
- acompanhar sua jornada
- aparecer em conquistas e progresso

Os avatares devem ser simples e amigáveis.

---

## 8. Mascote da plataforma

Após escolher o avatar, o aluno conhece o mascote do sistema: um **robô agente de trânsito**.

O mascote se comunica por **balões de texto**, de forma simples e inclusiva.

Funções do mascote:
- apresentar a plataforma
- guiar o aluno
- explicar atividades
- reforçar conceitos
- entregar recompensas

Ele atua como guia permanente durante a jornada. Em etapas como a preparação do desafio, o mascote pode utilizar balões de texto, mensagens ou um elemento surpresa que conduz o aluno ao jogo.

---

## 9. Experiência do aluno na aula (cadeia de eventos)

Cada aula segue um fluxo consistente. **O que o aluno vê na plataforma depende do que o professor já marcou no dashboard.**

### Etapa 1 – Complemento do mascote

Após a introdução do professor (e após ele marcar "Introdução concluída"), a aula é liberada. O mascote reforça o conceito principal em **balões de texto**. O aluno recebe uma pequena recompensa inicial.

### Etapa 2 – Sala de cinema

O mascote conduz o aluno para assistir o vídeo da aula (em balões de texto). Após o vídeo:
- a etapa é marcada como concluída
- ocorre um feedback visual

### Etapa 3 – Preparação do desafio

O mascote apresenta o desafio em **balões de texto** (ou com mensagem / elemento surpresa). Esse elemento leva o aluno ao jogo.

### Etapa 4 – Sala de jogos

O aluno entra no ambiente do jogo. Características:
- tutorial rápido do mascote (em balões de texto)
- possibilidade de repetir
- acumular XP

Quando a barra de XP é completada, o desafio é concluído.

### Etapa 5 – Recompensa do game

Ao completar o desafio o aluno recebe:
- XP
- aumento de nível
- card digital animado (vai para sua coleção)

---

## 10. Atividade presencial

Após o game, o professor retoma a aula em sala. Possíveis atividades:
- debate
- dramatização
- desenho
- atividade corporal

Essa etapa não ocorre na plataforma. Quando o professor termina, ele marca no dashboard **"Atividade concluída"**. A plataforma então **libera a Missão** para os alunos da turma.

---

## 11. Liberação da missão

Após a atividade presencial, o professor clica no dashboard **"Atividade concluída"**. A plataforma **libera a Missão** para os alunos. O mascote explica a tarefa ao aluno em **balões de texto**. A missão deve ser realizada fora da plataforma.

---

## 12. Conclusão da missão

Na aula seguinte, o professor avalia a missão (presencialmente ou por evidência). No dashboard, ele marca **"Missão validada"** para cada aluno que realizou a missão. Após a validação, a plataforma concede ao aluno:
- card adicional
- XP
- atualização de nível

Isso fecha o ciclo pedagógico da aula. A cadeia de eventos é: **Introdução concluída → libera aula | Atividade concluída → libera Missão | Missão validada → recompensa.**

---

## 13. Sistema de gamificação

A gamificação do Rua do Saber é baseada em:
- progresso visível
- recompensas leves
- feedback positivo

Elementos principais:
- barra de XP
- níveis
- cards digitais
- conquistas por progresso

**Não são utilizados:**
- streaks diários
- rankings competitivos
- punições por ausência

---

## 14. Experiência do professor

O professor possui um **dashboard** que deve permanecer aberto durante a aula. Por ele o professor:
- marca **"Introdução concluída"** → a plataforma libera a aula para os alunos
- acompanha quantos alunos concluíram cada etapa (Introdução, Vídeo, Game, Missão)
- marca **"Atividade concluída"** → a plataforma libera a Missão
- na aula seguinte, marca **"Missão validada"** por aluno

Exemplo de visão por aula (ex.: Aula 3 – Travessia segura):  
Introdução: 28 alunos | Vídeo: 26 alunos | Game: 24 alunos | Missão: 21 alunos

Esse painel ajuda a identificar alunos que precisam de apoio e mantém o professor no controle da sequência.

---

## 15. Experiência do gestor

O gestor institucional pode acompanhar:
- escolas participantes
- professores ativos
- turmas cadastradas
- progresso geral do programa
- relatórios de uso

---

## 16. Ritmo do programa

O programa segue o calendário escolar.

**Ritmo recomendado:** 2 a 3 aulas por mês.

Cada coleção anual possui **24 aulas**.

---

## 17. Objetivo da experiência

A plataforma deve oferecer:
- clareza pedagógica
- sensação de progresso
- experiência lúdica
- integração com a aula presencial

O sistema deve reforçar a aprendizagem sem competir com o papel do professor. O professor comanda a sequência; a plataforma responde a ele.

---

## 18. Diretriz para desenvolvimento

O desenvolvimento da plataforma deve priorizar:
- fluxo pedagógico claro
- **cadeia de eventos acionada pelo professor** (Introdução concluída, Atividade concluída, Missão validada)
- navegação simples
- feedback visual consistente
- **mascote com fala em balões de texto** (inclusivo e claro)
- **Lista de acessos** por turma (Nº | Nome | Usuário) para primeiro acesso
- separação entre ambientes de aluno, professor e gestor
- estrutura escalável para novas coleções

Detalhes técnicos de implementação podem ser refinados pela equipe de desenvolvimento com apoio do Cursor.

---

*Documento compilado a partir da versão original com incorporação das definições de controle do professor, primeiro acesso, mascote em balões de texto, validação da missão e regras de username/ID.*
